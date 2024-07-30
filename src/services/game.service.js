const { Game, Category, User } = require('../models');

const createGame = async (gameData) => {
  const game = await Game.create(gameData);
  return game;
};
const getAllGames = async (filter, options, userId) => {
  const result = await Game.paginate(filter, { ...options, populate: 'category' });
  if (userId) {
    const user = await User.findById(userId).select('favoriteGames').lean().exec();
    const favoriteGamesSet = new Set(user.favoriteGames.map((game) => game.toString()));

    // Map over results to add favorite field
    result.results = result.results.map((game) => ({
      ...game.toObject(),
      favorite: favoriteGamesSet.has(game._id.toString()) || false,
    }));
  }
  return result;
};
const updateGame = async (id, gameData) => {
  const game = await Game.findByIdAndUpdate(id, gameData, { new: true });
  return game;
};
const getGameById = async (id) => {
  const game = await Game.findById(id).populate('category');
  return game;
};
const getAllCategories = async (page, limit) => {
  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
  };

  const categories = await Category.paginate({}, options);
  return categories;
};
const createCategory = async (categoryData) => {
  const category = await Category.create(categoryData);
  return category;
};
module.exports = {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  getAllCategories,
  createCategory,
};
