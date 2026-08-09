const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverFile, 'utf8');

const routesToInject = [
  { varName: 'animalRoutes', path: './routes/animalRoutes', endpoint: '/api/animals' },
  { varName: 'feedInventoryRoutes', path: './routes/feedInventoryRoutes', endpoint: '/api/feed-inventory' },
  { varName: 'workerRoutes', path: './routes/workerRoutes', endpoint: '/api/workers' },
  { varName: 'vaccinationRoutes', path: './routes/vaccinationRoutes', endpoint: '/api/vaccinations' },
  { varName: 'medicineInventoryRoutes', path: './routes/medicineInventoryRoutes', endpoint: '/api/medicine-inventory' },
  { varName: 'biosecurityLogRoutes', path: './routes/biosecurityLogRoutes', endpoint: '/api/biosecurity' },
  { varName: 'diseaseRoutes', path: './routes/diseaseRoutes', endpoint: '/api/diseases' },
  { varName: 'shedRoutes', path: './routes/shedRoutes', endpoint: '/api/sheds' },
  { varName: 'attendanceRoutes', path: './routes/attendanceRoutes', endpoint: '/api/attendance' },
  { varName: 'treatmentRoutes', path: './routes/treatmentRoutes', endpoint: '/api/treatments' },
];

let importStr = "";
let useStr = "";

routesToInject.forEach(r => {
  if (!content.includes(r.path)) {
    importStr += `const ${r.varName} = require('${r.path}');\n`;
  }
  if (!content.includes(r.endpoint)) {
    useStr += `app.use('${r.endpoint}', ${r.varName});\n`;
  }
});

content = content.replace('const app = express();', `${importStr}\nconst app = express();`);
content = content.replace('// ── Health Check', `${useStr}\n// ── Health Check`);

fs.writeFileSync(serverFile, content);
console.log('Successfully injected routes into server.js');
