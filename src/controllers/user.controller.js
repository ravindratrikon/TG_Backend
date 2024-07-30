const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send({ result: user });
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.user.id, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const claimTask = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await userService.claimReward(userId, req.query.id);
  res.send(user);
});
const getAllTask = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { type } = req.query;
  const task = await userService.getAllTasks(userId, type);

  res.send({ result: task });
});

const getAllFriends = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { page, limit, sortBy } = req.query;

  const friends = await userService.getAllFriends(userId, page, limit, sortBy, 'friends');
  res.send(friends);
});
module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  claimTask,
  getAllTask,
  getAllFriends,
};
