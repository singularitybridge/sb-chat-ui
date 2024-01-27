import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getAllFiles = function(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(file => {
    if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
      arrayOfFiles = getAllFiles(`${dirPath}/${file}`, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
};

const outputFile = 'my-code.txt';
const allFiles = getAllFiles(__dirname).filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));

let content = '';
allFiles.forEach(filePath => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const relativeFilePath = path.relative(__dirname, filePath);
  content += `${relativeFilePath}:\n${fileContent}\n\n`;
});

fs.writeFileSync(path.join(__dirname, outputFile), content);
console.log(`All TypeScript files have been written to ${outputFile}`);
