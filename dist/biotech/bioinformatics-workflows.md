# Bioinformatics Workflows

> Patterns for building, maintaining, and scaling bioinformatics workflows.
Covers Nextflow, Snakemake, WDL/Cromwell, container orchestration,
and best practices for reproducible computational biology.


**Category:** biotech | **Version:** 1.0.0

---

## Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Restart from beginning after crash wastes hours/days of compute

**Why it happens:**
Genomics pipelines can run for days. Without checkpointing/caching:
- A network blip at hour 47 means starting over
- Cluster preemption restarts everything
- Debugging requires full re-runs

Most workflow managers have resume capability, but it must be configured.


**Solution:**
```
# Nextflow: Enable resume (default)
nextflow run main.nf -resume

# Snakemake: Use --keep-incomplete
snakemake --keep-incomplete ...

# Keep intermediate files until pipeline completes
# Don't mark as temp() until you're sure

# Use work directory on fast storage
workDir = '/scratch/nextflow_work'

```

**Symptoms:**
- Cluster job times out, entire pipeline restarts
- One sample fails, all samples re-run
- Intermediate files deleted before completion

---

### [HIGH] Glob patterns produce different order on different runs

**Why it happens:**
file() and glob patterns don't guarantee order.
Different filesystems return files in different orders.
This causes non-reproducible outputs even with same inputs.


**Solution:**
```
// Nextflow: Sort the channel
Channel
    .fromFilePairs("*.{1,2}.fq.gz")
    .toSortedList { it[0] }  // Sort by sample name
    .flatMap()
    .set { sorted_reads }

# Snakemake: Sort in rule
sorted_samples = sorted(samples)
expand("data/{sample}.bam", sample=sorted_samples)

# Always sort before merging
bcftools merge $(ls *.vcf.gz | sort) > merged.vcf.gz

```

**Symptoms:**
- Same inputs, different checksum on outputs
- Merged VCFs have samples in random order
- Hard to compare runs

---

### [HIGH] Files exist but container process can't read them

**Why it happens:**
Containers mount specific directories.
Symlinks pointing outside mounted directories are broken.
This is especially common with shared storage and staged inputs.


**Solution:**
```
// Nextflow: Use stageInMode 'copy' for problem files
process ALIGN {
    stageInMode 'copy'  // or 'link' with full path mounts
    ...
}

// Mount all required directories
docker.runOptions = '-v /data:/data -v /shared:/shared'
singularity.runOptions = '-B /data:/data -B /shared:/shared'

# Snakemake: Use shadow rules
rule align:
    shadow: "minimal"  # Copies inputs to temp dir
    ...

```

**Symptoms:**
- File not found errors in container
- Works outside container, fails inside
- Absolute path works, relative doesn't

---

### [HIGH] Jobs OOM killed or waste cluster resources

**Why it happens:**
Genomics tools have variable memory usage:
- BWA: ~5GB per thread for human genome
- STAR: 30-40GB for genome loading
- GATK: Varies wildly by step

Static memory requests don't account for sample size variation.


**Solution:**
```
// Nextflow: Dynamic memory based on input
process ALIGN {
    memory { 6.GB * task.cpus }

    // Or with retry
    memory { 8.GB * task.attempt }
    errorStrategy { task.exitStatus in 137..140 ? 'retry' : 'terminate' }
    maxRetries 3
}

# Snakemake: Use resources based on input
rule align:
    resources:
        mem_mb=lambda wildcards, input: max(8000, input.size_mb * 10)
    ...

# Profile tools to understand memory patterns
# Use /usr/bin/time -v to get max RSS

```

**Symptoms:**
- Jobs killed with OOM (out of memory)
- Jobs pending because requesting too much memory
- Cluster efficiency < 50%

---

### [HIGH] Pipeline continues after tool failure, producing garbage

**Why it happens:**
Some tools return non-zero exit codes for warnings.
Others return 0 even on failure.
Shell pipelines mask exit codes by default.


**Solution:**
```
# Use pipefail in shell
set -euo pipefail
bwa mem ref.fa reads.fq | samtools sort -o out.bam

# Nextflow: Always set in shell
process ALIGN {
    shell:
    '''
    set -euo pipefail
    bwa mem !{ref} !{reads} | samtools sort -o !{output}
    '''
}

# Validate outputs
if [[ ! -s output.fa ]]; then
    echo "Error: output file is empty" >&2
    exit 1
fi

# Check expected output patterns
samtools quickcheck aligned.bam || exit 1

```

**Symptoms:**
- Empty output files
- Truncated BAMs/VCFs
- Downstream tools fail with cryptic errors

---

### [CRITICAL] Parallel jobs overwrite each other's results

**Why it happens:**
When parallelizing, multiple jobs may try to write to the same file.
This causes race conditions and data loss.


**Solution:**
```
# Write to separate files, merge at end
parallel 'process {} > results/{/.}.txt' ::: samples/*
cat results/*.txt > combined_results.txt

# Use atomic writes
process {} > temp_$$.txt && mv temp_$$.txt final.txt

# Let workflow manager handle parallelism
# Don't manually parallelize within rules/processes

```

**Symptoms:**
- Random missing samples in merged output
- Different results each run
- File corruption errors

---

### [HIGH] Pipeline behavior changes without code changes

**Why it happens:**
'latest' tags get updated. Your pipeline pulls a new version
with different behavior, bugs, or broken dependencies.


**Solution:**
```
# Always use specific version tags
container = 'biocontainers/bwa:0.7.17--h5bf99c6_8'

# Use SHA256 digest for maximum reproducibility
container = 'biocontainers/bwa@sha256:abc123...'

# Lock all tool versions in environment
# Export conda-lock or requirements.txt

```

**Symptoms:**
- Pipeline worked yesterday, fails today
- Different results on different machines
- Can't reproduce old analysis

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `docker|singularity|container` | docker-containerization | Need custom container builds |
| `AWS|GCP|Azure|cloud` | cloud-architecture | Deploying to cloud infrastructure |
| `HPC|SLURM|PBS|cluster` | devops | Need cluster configuration |
| `CI/CD|GitHub Actions|testing` | test-architect | Need pipeline testing setup |

### Receives Work From

- **genomics-pipelines**: Need to orchestrate analysis pipeline
- **data-reproducibility**: Need reproducible computational environment

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/biotech/bioinformatics-workflows/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
