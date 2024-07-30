/* eslint-disable prettier/prettier */
const express = require('express');
const { botController } = require('../../controllers');

const router = express.Router();

router.route('/image').get(botController.getImage);

module.exports = router;
