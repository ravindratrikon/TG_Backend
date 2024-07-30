const express = require('express');
const userMiddleware = require('../../middlewares/userMiddleware');
const { gameController } = require('../../controllers');

const router = express.Router();

router.use(userMiddleware);
router.get('/:id/favourite', gameController.addToFavoriteController);
router.post('/', gameController.createGameController);
router.get('/category', gameController.getAllCategoriesController);
router.delete('/:id/favourite', gameController.removeFromFavoriteController);
router.get('/', gameController.getAllGamesController);
router.get('/:id', gameController.getGameByIdController);
router.put('/:id', gameController.updateGameController);

module.exports = router;
