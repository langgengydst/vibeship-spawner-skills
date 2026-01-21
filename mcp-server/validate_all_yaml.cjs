
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

const rootDir = path.resolve(__dirname, '..');

// Find ALL yaml files in the skills directory structure
// We assume skills are in directories at the root level (excluding node_modules, .git, mcp-server)
const files = glob.sync('**/*.yaml', { 
    cwd: rootDir, 
    ignore: [
        '**/node_modules/**', 
        '**/.git/**', 
        '**/mcp-server/**',
        '**/dist/**',
        '**/build/**'
    ] 
});

console.log(`Found ${files.length} YAML files. Validating...`);

let errorCount = 0;
const errors = [];

files.forEach(file => {
    const filePath = path.join(rootDir, file);
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Skip empty files
        if (!content.trim()) return;
        
        yaml.load(content);
    } catch (e) {
        errorCount++;
        errors.push({
            file: file,
            reason: e.reason,
            line: e.mark ? e.mark.line + 1 : 'unknown',
            column: e.mark ? e.mark.column + 1 : 'unknown',
            snippet: e.mark ? e.mark.snippet : 'no snippet'
        });
    }
});

if (errorCount > 0) {
    console.log(`\nFound ${errorCount} invalid YAML files:\n`);
    errors.forEach(err => {
        console.log(`File: ${err.file}`);
        console.log(`Error: ${err.reason} at line ${err.line}:${err.column}`);
        console.log('Snippet:');
        console.log(err.snippet);
        console.log('-'.repeat(40));
    });
    process.exit(1);
} else {
    console.log('\nAll YAML files are valid!');
    process.exit(0);
}
