const express = require('express')

const router = express.Router()

const indexController = require('../controller/index')

/* GET home page. */
router.get('/', indexController.index)

/* GET auto */
router.post('/auto', indexController.postAuto)

module.exports = router
