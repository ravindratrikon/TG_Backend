const path = require('path');
const catchAsync = require('../utils/catchAsync');

const getImage = catchAsync((_, res) => {
  const imagePath = path.resolve(__dirname, '../utils/images/logo.png');
  res.sendFile(imagePath);
});

module.exports = {
  getImage,
};
