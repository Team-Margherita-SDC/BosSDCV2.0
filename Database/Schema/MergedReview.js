const mongoose = require('mongoose');

const PhotosSchema = new mongoose.Schema({
  id: Number,
  url: String
})

const ResultsSchema = new mongoose.Schema({
  review_id: Number,
  rating: Number,
  summary: String,
  recommend: Boolean,
  response: String,
  body: String,
  date: Date,
  reviewer_name: String,
  helpfulness: Number,
  photos: [PhotosSchema],
  reviewer_email: String,
  reported: Boolean
})

const MergedReviewsSchema = new mongoose.Schema({
  product: Number,
  results: [ResultsSchema]
});

const MergedReview = mongoose.model('MergedReview', MergedReviewsSchema);

module.exports = MergedReview;