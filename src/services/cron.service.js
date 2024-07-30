const cron = require('node-cron');
const { User } = require('../models');
const logger = require('../config/logger');

const increaseDayCounter = async () => {
  await User.updateMany({ dayCounter: { $lt: 7 } }, { $inc: { dayCounter: 1 } });

  // Reset dayCounter to 1 for users where dayCounter is 7
  await User.updateMany({ dayCounter: 7 }, { $set: { dayCounter: 1 } });
};

const scheduleCoinResets = () => {
  // Schedule to increase day counter at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      await increaseDayCounter();
      logger.warn('Day counter increased successfully');
    } catch (error) {
      logger.error('Error increasing day counter:', error);
    }
  });
};

module.exports = {
  scheduleCoinResets,
};
