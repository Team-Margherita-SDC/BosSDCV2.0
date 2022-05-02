const express = require('express');
const app = express();
const axios = require('axios');
const mongoose = require('mongoose');
const path = require("path");
const port = process.env.PORT || 3000;
const db = require('../Database/index.js');
const MergedReview = require('../Database/Schema/MergedReview.js');
const MergedReviewsMeta = require('../Database/Schema/MergedReviewsMeta.js');

app.use(express.json());

app.get('/reviews', (req, res) => {
  MergedReview.find({product: req.query.product})
  .then(response => {
    res.status(200).send(response);
  })
  .catch(err => {
    res.status(500).end;
  })
})

app.get('/reviews/meta', (req, res) => {
  let product_id = req.query.product_id;

  MergedReviewsMeta.find({product_id: req.query.product_id})
  .then(response => {

    let metaData = {
      "product": response[0].product_id,
      "characteristics": {}
    };

    let
      oneStarReviews = 0,
      twoStarReviews = 0,
      threeStarReviews = 0,
      fourStarReviews = 0,
      fiveStarReviews = 0,
      yes = 0,
      no = 0;

    for (let i = 0; i < response.length; i++) {

      if (response[i].rating === 1) {
        oneStarReviews++;
      } else if (response[i].rating === 2) {
        twoStarReviews++;
      } else if (response[i].rating === 3) {
        threeStarReviews++;
      } else if (response[i].rating === 4) {
        fourStarReviews++;
      } else if (response[i].rating === 5) {
        fiveStarReviews++;
      }

      if (response[i].recommend === 'false') {
        no++;
      } else if (response[i].recommend === 'true') {
        yes++;
      }

      for (let j = 0; j < response[i].name.length; j++) {
        response[i].name[j].value = response[i].chars[j].value;
      }

      for (let j = 0; j < response[i].name.length; j++) {

        let characteristicName = response[i].name[j].name;
        let characteristicID = response[i].name[j].id;
        let characteristicValue = response[i].name[j].value;

        if (!metaData.characteristics[characteristicName]) {
          metaData.characteristics[characteristicName] = {
            id: characteristicID,
            value: parseFloat((characteristicValue / response.length).toFixed(4))
          }
        } else if (metaData.characteristics[characteristicName]) {
          metaData.characteristics[characteristicName].value += parseFloat((characteristicValue / response.length).toFixed(4));
        }

      }

    }

    metaData.ratings = {
      1: oneStarReviews,
      2: twoStarReviews,
      3: threeStarReviews,
      4: fourStarReviews,
      5: fiveStarReviews
    }

    metaData.recommend = {
      "true": yes,
      "false": no
    }

    res.status(200).send(metaData);

  })
  .catch(err => {

    res.status(500).end;

  })
})

app.post('/reviews', (req, res) => {

  const reviewPhotos = [];

  req.body.results.photos.forEach((photo) => {
    reviewPhotos.push(photo);
  });

  const newMergedReview = new MergedReview({
    product: req.body.product,
    results: [
      {
        review_id: req.body.results.review_id,
        rating: req.body.results.rating,
        summary: req.body.results.summary,
        recommend: req.body.results.recommend,
        response: req.body.results.response,
        body: req.body.results.string,
        date: req.body.results.date,
        reviewer_name: req.body.results.reviewer_name,
        helpfulness: 0,
        photos: reviewPhotos,
        reviewer_email: req.body.results.reviewer_email,
        reported: 'false'
      }
    ]
  });

  newMergedReview.save()

  .then(response => {

    res.status(200).send(response);

  })

  .catch(err => {

    res.status(500).end();

  })
})

app.put('/reviews/:review_id/helpful', (req, res) => {

  MergedReview.updateOne(

    {'results.review_id': req.params.review_id},
    {$inc: {"results.$.helpfulness": 1}}

  )

  .then(response => {

    res.status(204).send(response);

  })

  .catch(err => {

    res.status(500).end();

  })
})

app.put('/reviews/:review_id/report', (req, res) => {

  MergedReview.updateOne(

    {'results.review_id': req.params.review_id},
    {$set: {"results.$.reported": true}}
  )
  .then(response => {

    res.status(204).send(response);

  })

  .catch(err => {

    res.status(500).end();

  })

})

app.listen(port, () => {
  console.log(`The app server is running on port: ${port}`);
});