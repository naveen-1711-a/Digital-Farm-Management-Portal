const fs = require('fs');
const path = require('path');

const dir = 'd:/digital-farm-management-portal/frontend/src/pages/manager/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  let p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  
  // Upgrade button styles
  content = content.replace(/padding:\s*'0\.[45]rem',\s*borderRadius:\s*'6px'/g, "padding: '0.5rem', borderRadius: '8px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'");
  content = content.replace(/padding:\s*'0\.[45]rem\s+0\.[8]rem',\s*borderRadius:\s*'6px'/g, "padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'");
  
  fs.writeFileSync(p, content, 'utf8');
});
console.log('done');
