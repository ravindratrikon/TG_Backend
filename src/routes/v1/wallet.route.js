const express = require('express');
const { walletController } = require('../../controllers');
const getUserInfoMiddleware = require('../../middlewares/userMiddleware');

const router = express.Router();

router.get('/balance', getUserInfoMiddleware, walletController.getBalance);
router.get('/transactions', getUserInfoMiddleware, walletController.getAllWalletTransactions);

module.exports = router;
