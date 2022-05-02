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
// Add in folder for static file serving once API is optimized, plus filepaths for HTML file and distribution directory?  This seems like something to discuss with the team.

app.get('/reviews', (req, res) => {
  console.log('request product:', req.query);
  MergedReview.find({product: req.query.product})
  .then(response => {
    res.status(200).send(response);
  })
  .catch(err => {
    console.log(err);
    res.status(500).end;
  })
})

// Need to get this data into the proper form.  Use Postman to send the correct structure and then save it according to a schema that uses this structure.  Especially the 'id' parameter, which should be 'review_id'
app.get('/reviews/meta', (req, res) => {
  let product_id = req.query.product_id;
  MergedReviewsMeta.find({product_id: req.query.product_id})
  .then(response => {
    let metaData = {
      "product": response[0].product_id
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
      // console.log("response", i, response[i]);
      // console.log("characteristics:", i, response[i].chars);
      // console.log("names:", i, response[i].name);
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
      console.log("before:", response[i]);
      for (let j = 0; j < response[i].name.length; j++) {
        response[i].name[j].value = response[i].chars[j].value;
      }
      console.log("after:", response[i]);
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
    console.log(err);
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
    console.log(err);
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
    console.log('Error encountered uploading record.  See follwoing:', err)
    res.status(500).end();
  })
})

app.listen(port, () => {
  console.log(`The app server is running on port: ${port}`);
});

// TEST REVIEW ENDPOINT DATA
// {
//   "product": "1900000",
//   "results": {
//       "review_id": "2000000",
//       "rating": "4",
//       "summary": "Pretty decent!",
//       "recommend": "true",
//       "response": "We're so happy you like the product!",
//       "body": "I hope these last a few years becuase they're beautiful!",
//       "date": "2021-01-16T06:51:25.873Z",
//       "reviewer_name": "ShoeGuy90",
//       "helpfulness": "1",
//       "photos": [
//           {
//           "id": "1800000",
//           "url": "www.thisisjustanapitest.com/thisisjustanapitestphoto"
//           },
//           {
//           "id": "1800001",
//           "url": "www.thisisjustanapitest.com/thisisjustanapitestphoto"
//           }
//       ]
//   }
// }

// TEST REVIEW/META ENDPOINT DATA
// {
//   "product": "1900000",
//   "ratings": {
//     1: 0,
//     2: 34,
//     3: 23
//     4: 24
//     5: 45
//   },
//   "recommended": {
//     "true": 22,
//     "false": 456
//   },
//   "characteristics": {
//     "Size": {
//       "id": 14,
//       "value": "4.0000"
//     },
//     "Width": {
//       "id": 15,
//       "value": "3.5000"
//     },
//     "Comfort": {
//       "id": 16,
//       "value": "4.0000"
//     },
//     "Quality": {
//       "id": 14,
//       "value": "4.0000"
//     },
//     "Fit": {
//       "id": 15,
//       "value": "3.5000"
//     },
//     "Length": {
//       "id": 16,
//       "value": "4.0000"
//     },
//   }
// }