const mongoose = require('mongoose');
// const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    gamerId: {
      type: String,
      trim: true,
    },
    gameInfo: {
      type: Object,
    },
    // email: {
    //   type: String,
    //   trim: true,
    //   lowercase: true,
    //   validate(value) {
    //     if (!validator.isEmail(value)) {
    //       throw new Error('Invalid email');
    //     }
    //   },
    // },
    // password: {
    //   type: String,
    //   trim: true,
    //   minlength: 8,
    //   validate(value) {
    //     if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    //       throw new Error('Password must contain at least one letter and one number');
    //     }
    //   },
    //   private: true, // used by the toJSON plugin
    // },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },

    level: {
      type: Number,
      default: 1,
    },
    point: {
      type: Number,
      default: 0,
    },

    inviteCode: {
      type: String,
      unique: true,
    },
    dailyPoint: {
      type: Number,
      default: 0,
    },
    totalDailyRewards: {
      type: Number,
      default: 0,
    },
    weeklyPoint: {
      type: Number,
      default: 0,
    },
    dailyRewardsClaimed: { type: [Boolean], default: Array(7).fill(false) },
    dayCounter: {
      type: Number,
      default: 1,
    },
    profilePic: {
      type: String,
      default: '',
    },
    wallet: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    coverPic: {
      type: String,
    },
    favoriteGames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
      },
    ],

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    invitePoints: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
