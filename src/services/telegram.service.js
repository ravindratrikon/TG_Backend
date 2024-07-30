/* eslint-disable import/no-unresolved */
const axios = require('axios');
const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const { Telegraf } = require('telegraf');
const serviceAccount = require('../../firebase.json');
const logger = require('../config/logger');
// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Use the environment variable
});

// Initialize Telegram Bot
const apiToken = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;

const bot = new Telegraf(apiToken || '');

bot.start(async (ctx) => {
  try {
    const imageUrl = `${process.env.HOST_URL}/v1/bot/image`;
    const description = `
*Welcome to Trikon*
🌟 Welcome to Trikon\\- The platform for web3 games\\. Explore Trikon Games, participate in our community, and earn points to get our \\$TRK Token 🚀

🎮 Our top games:
1\\. Krypto Klash
2\\. Ridge Valley Racing
3\\. Flappy Bird
`;

    ctx.replyWithPhoto(
      { url: imageUrl },
      {
        caption: description,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Play',
                web_app: { url: `${webAppUrl}` },
              },
            ],
          ],
        },
        parse_mode: 'MarkdownV2',
      }
    );
  } catch (e) {
    logger.error(e);
  }
});

bot.telegram.setWebhook(`${process.env.HOST_URL}/telegram/webhooks`);

// Function to download profile picture and upload to Firebase Storage
async function downloadProfilePic(fileId, channelUserName) {
  const url = `https://api.telegram.org/bot${apiToken}/getFile`;
  const params = new URLSearchParams({ file_id: fileId });

  const response = await axios.get(`${url}?${params.toString()}`);
  const filePath = response.data && response.data.result && response.data.result.file_path;

  if (!filePath) {
    return '';
  }

  const fileUrl = `https://api.telegram.org/file/bot${apiToken}/${filePath}`;
  const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(fileResponse.data, 'binary');

  const bucket = getStorage().bucket();
  const file = bucket.file(channelUserName);

  await file.save(buffer, {
    metadata: { contentType: 'image/jpeg' },
    public: true, // Make the file publicly accessible
  });

  logger.info('Image uploaded to Firebase Storage.');

  // Generate a public URL for the uploaded file
  const profilePicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
  logger.info(`Uploaded file URL: ${JSON.stringify(profilePicUrl)}`);
  return profilePicUrl;
}

// Function to get the photo link for a Telegram channel
const getPhotoLink = async (channelInfo) => {
  logger.warn('Channel Info:', channelInfo);

  if (channelInfo.photo) {
    const fileId = channelInfo.photo.big_file_id;
    const { username } = channelInfo;
    return downloadProfilePic(fileId, username);
  }
  logger.warn('No profile picture found for the channel.');
  return '';
};

// Function to get the profile picture for a Telegram user
const getUserInfo = async (userId) => {
  try {
    const user = await bot.telegram.getChat(userId);
    logger.info(JSON.stringify(user));
    return user;
  } catch (error) {
    logger.error('Error fetching user info:', error);
    return null;
  }
};
const getProfilePic = async (userDoc) => {
  const { userId: chatId, _id: userId } = userDoc;
  const user = await bot.telegram.getChat(chatId);
  logger.info(JSON.stringify(user));

  if (!user || !user.photo || !user.photo.small_file_id) {
    return '';
  }

  return downloadProfilePic(user.photo.small_file_id, userId.toString());
};

module.exports = {
  getPhotoLink,
  getProfilePic,
  bot,
  getUserInfo,
};
