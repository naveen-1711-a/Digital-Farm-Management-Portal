const fs = require('fs');
const path = require('path');

const dir = 'd:/digital-farm-management-portal/frontend/src/pages/manager/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const actionButtons = `
                    <button onClick={() => toast.success('Loading history...')} title="View History" style={{ background: '#f3f4f6', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#4b5563', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaHistory /></button>
                    <button onClick={() => toast.success('QR Code / RFID Generated')} title="Generate QR" style={{ background: '#e0e7ff', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#4338ca', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaQrcode /></button>
                    <button onClick={() => toast.success('Edit Modal Opened')} title="Edit" style={{ background: '#fef3c7', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#d97706', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaEdit /></button>
                    <button onClick={() => toast.error('Item Deleted')} title="Delete" style={{ background: '#fee2e2', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaTrash /></button>
`;

files.forEach(file => {
  let p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  
  // 1. Make sure icons are imported
  const iconsNeeded = ['FaHistory', 'FaQrcode', 'FaEdit', 'FaTrash'];
  const reactIconsMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]react-icons\/fa['"];/);
  
  if (reactIconsMatch) {
    let existingIcons = reactIconsMatch[1].split(',').map(i => i.trim());
    iconsNeeded.forEach(icon => {
      if (!existingIcons.includes(icon)) {
        existingIcons.push(icon);
      }
    });
    content = content.replace(reactIconsMatch[0], `import { ${existingIcons.join(', ')} } from 'react-icons/fa';`);
  } else {
    content = `import { ${iconsNeeded.join(', ')} } from 'react-icons/fa';\n` + content;
  }

  // 2. Replace the action td content
  // We look for <td style={{ padding: '1rem', textAlign: 'right'... }}> ... </td>
  const tdRegex = /(<td[^>]*textAlign:\s*'right'[^>]*>)([\s\S]*?)(<\/td>)/g;
  
  content = content.replace(tdRegex, (match, p1, p2, p3) => {
    // If the td already has the FaHistory button, we can just replace its contents, or skip if it's already perfect.
    // For simplicity, we just replace whatever was in there with the new buttons.
    return p1 + actionButtons + p3;
  });

  fs.writeFileSync(p, content, 'utf8');
});

console.log('Action buttons added to all manager pages successfully.');
