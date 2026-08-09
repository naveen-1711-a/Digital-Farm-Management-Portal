const express = require('express');
const { getAll, getOne, create, update, delete: deleteDoc } = require('../controllers/reportController');

const router = express.Router();

router.route('/')
  .get(getAll)
  .post(create);

router.route('/:id')
  .get(getOne)
  .put(update)
  .delete(deleteDoc);

module.exports = router;
