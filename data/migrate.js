import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const network = process.argv[2]
const dirPath = `${network}/data`

// Define source and destination directories
const sourceDir = path.join(__dirname, dirPath);
const destRootDir = path.join(__dirname, dirPath);

// Ensure destination root exists
if (!fs.existsSync(destRootDir)) {
  fs.mkdirSync(destRootDir);
}

// Read all files in source directory
fs.readdirSync(sourceDir).forEach(file => {
  if (/^[A-Z2-7]{3}\.json$/.test(file)) {
    const baseName = path.basename(file, '.json'); // e.g., 'ABC'
    const parts = baseName.split(''); // ['A', 'B', 'C']
    const filePart = `${parts.pop()}.json` // C

    const destDir = path.join(destRootDir, ...parts); // A/B
    const destPath = path.join(destDir, filePart); // A/B/C.json

    // Create destination directory
    fs.mkdirSync(destDir, { recursive: true });

    const sourcePath = path.join(sourceDir, file);

    // Move file to destination
    fs.renameSync(sourcePath, destPath);

    // Create a symlink in the original location pointing to the new location
    const relativeTarget = path.relative(sourceDir, destPath);
    fs.symlinkSync(relativeTarget, sourcePath);

    console.log(`Moved ${file} → ${path.relative(__dirname, destPath)} and created symlink`);
  }
});

