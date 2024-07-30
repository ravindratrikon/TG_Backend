const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

const gameSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Category',
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
gameSchema.plugin(toJSON);
gameSchema.plugin(paginate);

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
