const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);
let modifiedCount = 0;

const regexSingle = /'http:\/\/localhost:5000\/api(.*?)'/g;
const regexDouble = /"http:\/\/localhost:5000\/api(.*?)"/g;
const regexBacktick = /`http:\/\/localhost:5000\/api(.*?)`/g;

const replacement = '`${import.meta.env.VITE_API_URL || \'http://localhost:5000/api\'}$1`';

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Specifically skip api.js if it already has the VITE_API_URL
    if (file.includes('api.js')) {
        return;
    }

    content = content.replace(regexSingle, replacement);
    content = content.replace(regexDouble, replacement);
    content = content.replace(regexBacktick, replacement);

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
        modifiedCount++;
    }
});

console.log(`Replaced URLs in ${modifiedCount} files.`);
