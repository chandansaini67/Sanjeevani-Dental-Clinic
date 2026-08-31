import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const prohibited = /₹|\b(?:price|prices|pricing|cost|costs|fee|fees|affordable|payment|payments|charge|charges)\b|\b(?:Rs\.?|INR)\b/i;

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git') return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : path.endsWith('.html') ? [path] : [];
  });
}

const findings = walk(process.cwd()).flatMap((path) =>
  readFileSync(path, 'utf8').split(/\r?\n/).flatMap((line, index) =>
    prohibited.test(line) ? [`${path}:${index + 1}: ${line.trim()}`] : []
  )
);

if (findings.length) {
  console.error(findings.join('\n'));
  process.exit(1);
}
console.log('No public pricing content found.');
