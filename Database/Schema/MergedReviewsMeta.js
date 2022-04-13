const mongoose = require('mongoose');

const MergedReviewsMetaSchema = new mongoose.Schema({
  product_id: Number,
  rating: Number,
  recommend: String,
  characteristicIdsAndValues: {
    characteristics: [
      {
        characteristic_id: Number,
        value: Number
      }
    ]
  },
  name: [
    {
      id: Number,
      product_id: Number,
      name: String
    }
  ]
})


const MergedReviewsMeta = mongoose.model('MergedReviewsMeta', MergedReviewsMetaSchema);

module.exports = MergedReviewsMeta;