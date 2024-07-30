const { gameService, userService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createGameController = catchAsync(async (req, res) => {
  const gameData = req.body; // Assuming request body contains game data
  const game = await gameService.createGame(gameData);
  res.status(201).json({ result: game });
});

const getAllGamesController = catchAsync(async (req, res) => {
  const { name, page, limit, category, type } = req.query;
  const userId = req.user._id;

  const filter = name ? { name: { $regex: new RegExp(name, 'i') } } : {};
  if (category) {
    filter.category = category; // Assuming category is a valid ID or name
  }
  if (type === 'favourite') {
    filter._id = { $in: req.user.favoriteGames };
  }

  const options = { page, limit };

  const games = await gameService.getAllGames(filter, options, userId);
  res.status(200).json(games);
});

const getGameByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const game = await gameService.getGameById(id);
  game.gameInfo = req.user.gameInfo[id];
  res.status(200).json({ result: game });
});
const updateGameController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const gameData = req.body; // Assuming request body contains the updated game data
  const { gameInfo } = req.body;
  delete req.body.score;
  if (gameInfo.earnedPoints) {
    // Update user points, daily points, weekly points, total reward, etc.
    req.user.point += gameInfo.earnedPoints;
    delete gameInfo.earnedPoints;
  }
  const game = await gameService.updateGame(id, gameData);
  if (!game) {
    return res.status(404).json({ message: 'Game not found' });
  }
  if (gameInfo) {
    const user = await userService.updateUserByQuery(
      { _id: req.user.id },
      {
        $set: {
          [`gameInfo.${id}`]: gameInfo,
        },
      },
      { new: true }
    );
    game.gameInfo = user.gameInfo[id];
  }
  await req.user.save();
  res.status(200).json({ result: game });
});

const getAllCategoriesController = catchAsync(async (req, res) => {
  const categories = await gameService.getAllCategories(req.query);
  res.status(200).json(categories);
});

const addToFavoriteController = catchAsync(async (req, res) => {
  const { id } = req.params;

  await userService.addToFavorite(req.user._id, id);
  res.status(200).json({ message: 'ok' });
});
const removeFromFavoriteController = catchAsync(async (req, res) => {
  const { id } = req.params;

  await userService.removeFromFavorite(req.user._id, id);
  res.status(200).json({ message: 'ok' });
});
module.exports = {
  getAllGamesController,
  getGameByIdController,
  createGameController,
  updateGameController,
  getAllCategoriesController,
  addToFavoriteController,
  removeFromFavoriteController,
};
