const mongoose = require('mongoose');

const MergedReviewsMetaSchema = new mongoose.Schema({
  product_id: Number,
  rating: Number,
  recommend: String,
  chars: [
    {
      characteristic_id: Number,
      value: Number
    }
  ],
  name: [
    {
      id: Number,
      name: String,
      value: Number
    }
  ]
})


const MergedReviewsMeta = mongoose.model('MergedReviewsMeta', MergedReviewsMetaSchema);

module.exports = MergedReviewsMeta;