const mongoose = require('mongoose');

const MergedReviewsMetaTest4Schema = new mongoose.Schema({
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


const MergedReviewsMetaTest4 = mongoose.model('MergedReviewsMetaTest4', MergedReviewsMetaTest4Schema);

module.exports = MergedReviewsMetaTest4;