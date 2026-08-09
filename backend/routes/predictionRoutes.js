const express = require('express');
const router = express.Router();
const { savePrediction } = require('../controllers/predictionController');

router.post('/', savePrediction);

module.exports = router;
