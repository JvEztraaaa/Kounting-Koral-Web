const fs = require('fs');
const path = require('path');

function countFiles(dir, exclude = ['node_modules', '.git']) {
  let count = 0;
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!exclude.includes(item)) {
        count += countFiles(fullPath, exclude);
      }
    } else {
      count++;
    }
  }
  
  return count;
}

const projectDir = process.cwd();
const totalFiles = countFiles(projectDir);
console.log(`Total project files: ${totalFiles}`);
