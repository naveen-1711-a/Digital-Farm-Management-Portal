const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const controllersDir = path.join(__dirname, 'controllers');
const routesDir = path.join(__dirname, 'routes');

const models = fs.readdirSync(modelsDir)
  .filter(file => file.endsWith('.js') && file !== 'User.js')
  .map(file => path.basename(file, '.js'));

models.forEach(modelName => {
  const lowerModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  const routeName = lowerModelName + 'Routes';
  const controllerName = lowerModelName + 'Controller';
  
  if (modelName === 'Task') return; // skip

  const controllerCode = `const ${modelName} = require('../models/${modelName}');

exports.getAll = async (req, res) => {
  try {
    const data = await ${modelName}.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const data = await ${modelName}.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await ${modelName}.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await ${modelName}.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await ${modelName}.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
`;
  fs.writeFileSync(path.join(controllersDir, `${controllerName}.js`), controllerCode);

  const routeCode = `const express = require('express');
const { getAll, getOne, create, update, delete: deleteDoc } = require('../controllers/${controllerName}');

const router = express.Router();

router.route('/')
  .get(getAll)
  .post(create);

router.route('/:id')
  .get(getOne)
  .put(update)
  .delete(deleteDoc);

module.exports = router;
`;
  fs.writeFileSync(path.join(routesDir, `${routeName}.js`), routeCode);
});

console.log('CRUD controllers and routes generated for:', models.join(', '));
