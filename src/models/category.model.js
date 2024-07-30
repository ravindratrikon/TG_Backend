const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

const categorySchema = mongoose.Schema(
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
  },
  {
    strict: false,
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
categorySchema.plugin(toJSON);
categorySchema.plugin(paginate);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
