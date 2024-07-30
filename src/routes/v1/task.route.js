const express = require('express');
const { userController } = require('../../controllers');
const getUserInfoMiddleware = require('../../middlewares/userMiddleware');

const router = express.Router();

router.get('/', getUserInfoMiddleware, userController.getAllTask);
router.get('/:id', getUserInfoMiddleware, userController.claimTask);

module.exports = router;
