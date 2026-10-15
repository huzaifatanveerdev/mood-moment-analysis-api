const express = require('express');
const router = express.Router();
const { sayHello } = require('../controllers/testController');

router.get('/say-hello', sayHello);

module.exports = router;
