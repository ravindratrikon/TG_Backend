const httpStatus = require('http-status');
const { walletService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const getBalance = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const balance = await walletService.getBalance(userId);

  res.status(httpStatus.OK).json({ result: balance });
});
const getAllWalletTransactions = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const page = req.query.page || 1;
  const limit = req.query.page || 10;

  const transactions = await walletService.getAllWalletTransactions(userId, page, limit);

  res.status(httpStatus.OK).json({ result: transactions });
});

module.exports = {
  getBalance,
  getAllWalletTransactions,
};
