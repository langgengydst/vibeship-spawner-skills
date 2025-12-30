# Genomics Pipelines

> Patterns for building robust, reproducible genomics analysis pipelines.
Covers workflow managers, NGS data processing, variant calling, RNA-seq,
and common bioinformatics pitfalls.


**Category:** biotech | **Version:** 1.0.0

---

## Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] BWA/Bowtie cannot handle spliced alignments - massive read loss

**Why it happens:**
RNA-seq reads span exon-exon junctions. DNA aligners like BWA and Bowtie
expect contiguous genomic sequences. When a read crosses a splice junction,
the DNA aligner sees a ~10kb "deletion" (the intron) and fails to map.

You'll lose 40-70% of your reads, especially from multi-exon genes.


**Solution:**
```
# CORRECT - Use splice-aware aligner
STAR --genomeDir star_index \
     --readFilesIn reads_1.fq reads_2.fq \
     --outSAMtype BAM SortedByCoordinate

# Or HISAT2 (lower memory)
hisat2 -x genome_index -1 reads_1.fq -2 reads_2.fq -S aligned.sam

```

**Symptoms:**
- Low mapping rate (30-50%) for RNA-seq
- Most reads reported as unmapped
- Differential expression analysis fails

---

### [CRITICAL] Marking duplicates wrong for RNA-seq or amplicon data

**Why it happens:**
Duplicate marking assumes random fragmentation. This assumption is:
- TRUE for WGS/WES: Duplicates are PCR artifacts
- FALSE for RNA-seq: Same position = same transcript molecule
- FALSE for amplicon: Same position = same target by design

Marking duplicates in RNA-seq removes biological signal.
Marking duplicates in amplicon removes ALL your data.


**Solution:**
```
# RNA-seq: Skip duplicate marking OR use UMIs
# If you have UMIs:
umi_tools dedup -I aligned.bam -O deduped.bam --method=unique

# Amplicon: NEVER mark duplicates
# Use molecular barcodes/UMIs if deduplication is needed

# WGS/WES: Duplicate marking is correct
picard MarkDuplicates I=wgs_aligned.bam O=marked.bam M=metrics.txt

```

**Symptoms:**
- RNA-seq: Massive loss of reads from highly expressed genes
- Amplicon: All reads marked as duplicates
- Zero coverage in target regions

---

### [CRITICAL] chr1 vs 1 mismatch causes zero reads in output

**Why it happens:**
UCSC uses 'chr1', Ensembl/NCBI uses '1'.
If your reference uses 'chr1' but your VCF/BED uses '1',
NO coordinates will match. The tools won't warn you - they'll
just return empty results silently.


**Solution:**
```
# Always check contig names match
# In BAM:
samtools view -H aligned.bam | grep "^@SQ"

# In BED/VCF:
head -1 targets.bed

# Convert if needed:
sed 's/^chr//' ucsc_style.bed > ensembl_style.bed
# or
sed 's/^/chr/' ensembl_style.bed > ucsc_style.bed

# Best: Use consistent references from the start

```

**Symptoms:**
- Aligned BAM has reads, but variant caller finds nothing
- No reads overlap with annotation
- BED file intersection returns empty

---

### [HIGH] Wrong strand parameter halves your counts or doubles them

**Why it happens:**
Most RNA-seq protocols are stranded (dUTP, TruSeq Stranded).
If you quantify with the wrong strand parameter:
- Unstranded mode: Counts both strands (double counting)
- Wrong strand: Counts antisense (50% loss, wrong genes)


**Solution:**
```
# Detect strandedness with RSeQC
infer_experiment.py -i aligned.bam -r genes.bed

# Common library types:
# TruSeq Stranded: -s 2 (reverse)
# SMARTer: -s 1 (forward)
# Unstranded: -s 0

# For Salmon:
salmon quant ... -l A  # Auto-detect (recommended)

```

**Symptoms:**
- Gene counts are ~50% of expected
- Antisense genes show unexpected expression
- Same gene shows counts on both strands

---

### [HIGH] Randomly assigning or ignoring multi-mappers loses information

**Why it happens:**
10-30% of reads map to multiple locations (paralogs, gene families,
transposons). Default is often to assign randomly or discard.

Random assignment: Different results each run
Discarding: Lose information about gene families


**Solution:**
```
# Option 1: Probabilistic assignment (RECOMMENDED)
# Salmon and RSEM use EM algorithm
salmon quant --seqBias --gcBias ...

# Option 2: Report all alignments, handle downstream
STAR --outSAMmultNmax -1 --outSAMprimaryFlag AllBestScore ...

# Option 3: Count fractionally
featureCounts -M --fraction ...  # 1/N weight per location

```

**Symptoms:**
- Gene families show inconsistent expression
- Repetitive regions have zero coverage
- Quantification is unstable between runs

---

### [CRITICAL] Coordinates don't match between files from different assemblies

**Why it happens:**
GRCh37 (hg19) and GRCh38 (hg38) have different coordinates.
A variant at chr1:1000000 in GRCh37 might be at chr1:1060000 in GRCh38.

Mixing versions creates silent failures - tools won't crash,
they'll just give wrong results.


**Solution:**
```
# Always verify genome version
# Check chromosome lengths (they differ between versions)

# If you need to convert coordinates:
# Use UCSC liftOver or CrossMap
CrossMap.py vcf hg19ToHg38.chain grch37.vcf GRCh38.fa grch38.vcf

# Best practice: Document genome version in all filenames
sample_GRCh38.bam
dbsnp_b151_GRCh38.vcf

```

**Symptoms:**
- Known variants not found at expected positions
- Annotation file has different chromosome lengths
- VCF coordinates don't match reference

---

### [HIGH] Too few reads to detect variants or differential expression

**Why it happens:**
Different analyses need different depths:
- WGS germline: 30x minimum
- WES: 100x on target
- Somatic variants: 100-500x
- RNA-seq DE: 20-30M reads per sample
- Single-cell: Varies by application

Under-sequenced data gives false negatives, not errors.


**Solution:**
```
# Check coverage before analysis
samtools depth -a aligned.bam | \
    awk '{sum+=$3} END {print "Average coverage:", sum/NR}'

# For WGS: Should be >30x
# For WES: Check on-target coverage (>100x)
# For RNA-seq: Count total mapped reads

# If insufficient:
# 1. Sequence more (if possible)
# 2. Use methods designed for low-coverage data
# 3. Report as limitation

```

**Symptoms:**
- Rare variants not detected
- High false negative rate
- Differential expression has no significant genes

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `differential expression|DESeq2|edgeR` | statistical-analysis | Need statistical analysis of RNA-seq counts |
| `protein structure|alphafold|3D` | protein-structure | Need protein structure prediction |
| `workflow manager|nextflow|snakemake` | bioinformatics-workflows | Need complex workflow orchestration |
| `docker|singularity|container` | docker-containerization | Need containerized pipeline environment |
| `cloud|AWS|GCP|Azure` | cloud-architecture | Need cloud deployment for genomics pipeline |

### Receives Work From

- **scientific-method**: Need to design sequencing experiment
- **experimental-design**: Need to plan sample layout for batch effects

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/biotech/genomics-pipelines/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
