// services/walletService.js
const axios = require('axios');
const { User } = require('../models');

const apiKey = process.env.TRIKON_API_KEY;
const chainId = process.env.CHAIN_ID;
const paymasterUrl = process.env.TRIKON_URL;

const getUser = async (id) => {
  const user = await User.findById(id);
  return user;
};

const getBalance = async (userId) => {
  if (!apiKey || !chainId) {
    throw new Error('apiKey and chainId are required');
  }

  const userWalletAddress = await getUser(userId);

  if (!userWalletAddress) {
    throw new Error('User wallet address not found');
  }

  const response = await axios.post(`${paymasterUrl}/wallet/getBalance`, {
    apiKey,
    address: userWalletAddress.wallet.cfa,
    chainId,
  });

  return response.data.data;
};
const getAllWalletTransactions = async (userId, page, limit) => {
  if (!apiKey) {
    throw new Error('apiKey required');
  }

  const userWalletAddress = await getUser(userId);

  if (!userWalletAddress) {
    throw new Error('User wallet address not found');
  }

  const response = await axios.post(`${paymasterUrl}/wallet/getTransactions`, {
    apiKey,
    idToken: userWalletAddress.wallet.idToken,
    page,
    limit,
    typeOfLogin: userWalletAddress.wallet.typeOfLogin,
    walletAddress: userWalletAddress.wallet.cfa,
    chainId,
  });

  return response.data.results;
};

module.exports = {
  getBalance,
  getAllWalletTransactions,
};
