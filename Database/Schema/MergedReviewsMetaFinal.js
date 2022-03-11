const mongoose = require('mongoose');

const MergedReviewsMetaSchema = new mongoose.Schema({
  product_id: String,
  ratings: {
    1: Number,
    2: Number,
    3: Number,
    4: Number,
    5: Number
  },
  recommended: {
    true: Number,
    false: Number
  },
  characteristics: {
    Size: {
      id: Number,
      value: String
    },
    Width: {
      id: Number,
      value: String
    },
    Comfort: {
      id: Number,
      value: String
    },
    Length: {
      id: Number,
      value: String
    },
    Fit: {
      id: Number,
      value: String
    },
    Quality: {
      id: Number,
      value: String
    }
  }
})


const MergedReviewsMeta = mongoose.model('MergedReviewsMeta', MergedReviewsMetaSchema);

module.exports = MergedReviewsMeta;