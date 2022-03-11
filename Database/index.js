const mongoose = require('mongoose');
const { MergedReview } = require('./Schema/MergedReview.js');
const { ReviewsMeta } = require('./Schema/MergedReviewsMeta.js');

const mongoURI = 'mongodb://localhost:27017/ratingsandreviews';

const db = mongoose.connect(mongoURI, { useNewUrlParser: true });

db
  .then(db => console.log(`Connected to: ${mongoURI}`))
  .catch(err => {
    console.log(`Could not connect to the MongoDB server at ${mongoURI}.  Error encountered: ${err}`);
  });

module.exports.db = db;
module.exports.mongoURI;
module.exports.Reviews;
module.exports.ReviewsMeta;