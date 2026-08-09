const express = require('express');
const multer = require('multer');
const { getAll, getOne, create, update, delete: deleteDoc, predictDisease } = require('../controllers/diseaseController');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route('/predict')
  .post(upload.single('image'), predictDisease);

router.route('/')
  .get(getAll)
  .post(create);

router.route('/:id')
  .get(getOne)
  .put(update)
  .delete(deleteDoc);

module.exports = router;
