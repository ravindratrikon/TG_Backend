const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { User, Activity } = require('../models');
const ApiError = require('../utils/ApiError');
const { getProfilePic, getUserInfo } = require('./telegram.service');
const logger = require('../config/logger');
const { dailyRewards, weeklyRewards, watchDailyVideo, taskOfTheday } = require('../utils/response');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

const claimReward = async (userId, taskId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const dayIndex = user.dayCounter - 1;

    // Find the reward set and determine its type
    const dailyReward = dailyRewards.find((reward) => reward.id === Number(taskId));

    const weeklyReward = weeklyRewards.find((reward) => reward.id === Number(taskId));

    if (!dailyReward && !weeklyReward) throw new Error('Reward not found');

    if (dailyReward) {
      if (dayIndex >= dailyReward.dailyTask.length || user.dailyRewardsClaimed[dayIndex]) {
        throw new Error('Invalid day index for claiming this daily reward');
      }

      // Mark daily reward as claimed and update coins
      user.dailyRewardsClaimed[dayIndex] = true;
      user.markModified('dailyRewardsClaimed');
      const pointToAdd = dailyReward.dailyTask[dayIndex].point;

      user.point += pointToAdd;
      user.totalDailyRewards += pointToAdd;
      user.dailyPoint += pointToAdd;
      user.weeklyPoint += pointToAdd;

      await Activity.create({
        user: user._id,
        taskId: dailyReward.id,
        name: dailyReward.name,
        type: 'task',
        coins: dailyReward.dailyTask[dayIndex].point,
      });
    } else if (weeklyReward) {
      if (user.dayCounter < 7 || user.weeklyRewardsClaimed) {
        throw new Error('Weekly reward can only be claimed after completing 7 days');
      }

      // Mark weekly reward as claimed and update coins
      user.dailyRewardsClaimed[dayIndex] = true;
      user.markModified('dailyRewardsClaimed');
      const pointToAdd = weeklyReward.point;

      user.point += pointToAdd;
      user.totalDailyRewards += pointToAdd;
      user.dailyPoint += pointToAdd;
      user.weeklyPoint += pointToAdd;

      await Activity.create({
        userId: user._id,
        taskId: weeklyReward.id,
        name: weeklyReward.name,
        type: 'task',
        point: weeklyReward.point,
      });
    }

    // Save the updated user document
    await user.save();

    return user;
  } catch (error) {
    logger.error('Error claiming reward:', error.message);
    throw error;
  }
};

/**
 * Get all tasks for a user (daily and weekly).
 */
const getAllTasks = async (userId, type) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const dayIndex = user.dayCounter - 1;

    const dailyTasks = dailyRewards.map((rewardSet) => ({
      id: rewardSet.id,
      name: rewardSet.name,
      claimed: user.dailyRewardsClaimed[dayIndex] || false,
      point: rewardSet.dailyTask[dayIndex].point,
      dailyTask: rewardSet.dailyTask.map((task, index) => ({
        name: task.name,
        point: task.point,
        claimed: user.dailyRewardsClaimed[index] || false,
      })),
    }));

    const weeklyTask = {
      id: weeklyRewards[0].id,
      name: weeklyRewards[0].name,
      point: weeklyRewards[0].point,
      claimed: user.dailyRewardsClaimed[6] || false,
    };
    dailyTasks.push(weeklyTask);
    if (type === 'home') {
      dailyTasks.push(taskOfTheday[0]);
      dailyTasks.push(watchDailyVideo[0]);
    }
    return dailyTasks;
  } catch (error) {
    logger.error('Error fetching tasks:', error.message);
    throw error;
  }
};

const updateUserByQuery = (filters, query) => {
  return User.findOneAndUpdate(filters, query, { new: true });
};

const addToFavorite = async (userId, gameId) => {
  try {
    // Find the user by ID and update the favorite games list
    const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { favoriteGames: gameId } }, { new: true });

    return updatedUser;
  } catch (error) {
    throw new Error(`Failed to add game to favorites: ${error.message}`);
  }
};
const removeFromFavorite = async (userId, gameId) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, { $pull: { favoriteGames: gameId } }, { new: true });

    return updatedUser;
  } catch (error) {
    throw new Error(`Failed to remove game from favorites: ${error.message}`);
  }
};

const getAllFriends = async (userId, page = 1, limit = 10, sortBy = 'createdAt', populate = 'friends') => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const filter = { _id: { $in: user.friends } };

  const options = { page, limit, sortBy, populate, select: '-wallet.password' };

  const friends = await User.paginate(filter, options);

  return friends;
};

const getUserByQuery = async (filter, options = {}) => {
  return User.findOne(filter, options);
};

// Helper function to generate a random password
const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8);
};

const generateJWT = async (data) => {
  try {
    const token = jwt.sign(data, process.env.TRIKON_JWT_SECRET_KEY, { expiresIn: '6d' });
    return token;
  } catch (error) {
    logger.error('Error while generating token :', error);
  }
};
const loginOrRegisterUser = async (reqBody) => {
  const { username, userId } = reqBody;

  try {
    // Find or create user with username and userId
    let user = await User.findOneAndUpdate(
      { userId },
      { $setOnInsert: { username } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    if (!user.inviteCode) {
      const generateInviteCode = generateRandomPassword();
      user = await User.findByIdAndUpdate(user._id, { inviteCode: generateInviteCode }, { new: true }).lean();
    }
    const telegramProfile = await getUserInfo(userId);
    const url = (await getProfilePic(user)) || '';
    const token = await generateJWT({
      username: telegramProfile.username,
      telegramId: telegramProfile.id,
      firstName: telegramProfile.first_name,
      lastName: telegramProfile.last_name || '',
      photoUrl: url,
    });

    const { data } = await axios.post(`${process.env.TRIKON_URL}/wallet/loginWithTelegram`, {
      token,
    });

    if (data.httpCode === 200) {
      // Update user with wallet information
      user = await User.findOneAndUpdate(
        { userId },
        { $set: { gamerId: data.data.tid || `${data.data.username}.tid`, wallet: { ...data.data } } },
        { new: true }
      ).lean();
    }

    // Fetch or update profile picture for the user
    user.profilePic = await getProfilePic(user);

    return user;
  } catch (error) {
    logger.error(`Error in loginOrRegisterUser: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  getUserByQuery,
  updateUserById,
  deleteUserById,
  loginOrRegisterUser,
  claimReward,
  getAllTasks,
  updateUserByQuery,
  addToFavorite,
  removeFromFavorite,
  getAllFriends,
};
