const express = require('express');
const { activityController } = require('../../controllers');
const getUserInfoMiddleware = require('../../middlewares/userMiddleware');

const router = express.Router();

router.get('/', getUserInfoMiddleware, activityController.getAllActivity);
router.post('/', getUserInfoMiddleware, activityController.createActivity);
router.put('/:id', getUserInfoMiddleware, activityController.updateActivity);

module.exports = router;
