const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

const activitySchema = mongoose.Schema(
  {
    invitee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
activitySchema.plugin(toJSON);
activitySchema.plugin(paginate);

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
