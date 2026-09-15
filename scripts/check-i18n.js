const fs = require('fs');
const path = require('path');

const en = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/locales/en/translation.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/locales/hi/translation.json'), 'utf8'));

function getAllFiles(dir, exts, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        getAllFiles(fullPath, exts, fileList);
      }
    } else {
      if (exts.includes(path.extname(fullPath))) {
        fileList.push(fullPath);
      }
    }
  });
  return fileList;
}

const files = getAllFiles(path.join(__dirname, '../app'), ['.tsx', '.ts']).concat(
  getAllFiles(path.join(__dirname, '../components'), ['.tsx', '.ts'])
);

const tRegex = /\bt\(\s*["']([^"']+)["']\s*[\),]/g;
const usedKeys = new Set();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    usedKeys.add(match[1]);
  }
});

const missingInEn = [];
const missingInHi = [];

usedKeys.forEach(k => {
  if (!(k in en)) missingInEn.push(k);
  if (!(k in hi)) missingInHi.push(k);
});

console.log('Total unique static t(...) keys found in code:', usedKeys.size);
console.log('Keys missing in EN:', missingInEn);
console.log('Keys missing in HI:', missingInHi);

// Also check for dynamic scheme / status / partner names
const dynamicExpected = [
  "Micro Finance Scheme",
  "National Concessional Term Loan Scheme",
  "Subsidized Education Loan Scheme",
  "Submitted",
  "Under Review",
  "Documents Verified",
  "Loan Approved",
  "Disbursed",
  "Rejected",
  "Male",
  "Female",
  "Other",
  "Active",
  "Inactive",
  "All States",
  "All Schemes"
];

const missingDynamicInEn = dynamicExpected.filter(k => !(k in en));
const missingDynamicInHi = dynamicExpected.filter(k => !(k in hi));

console.log('Dynamic keys missing in EN:', missingDynamicInEn);
console.log('Dynamic keys missing in HI:', missingDynamicInHi);
