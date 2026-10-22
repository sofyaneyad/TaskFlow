const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        results = results.concat(walk(full));
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(full);
    }
  });
  return results;
}

const allFiles = walk('C:/Users/SOFYAN/Desktop/TaskFlow/src');
allFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('useEffect(')) {
      console.log(path.relative('C:/Users/SOFYAN/Desktop/TaskFlow', f) + ':' + (i+1) + ' ' + l.trim());
    }
  });
});
