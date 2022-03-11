let {
  db,
  dbName,
  characteristics,
  characteristics_reviews,
  reviews,
  reviews_photos,
  z_mock_characteristics,
  z_mock_characteristic_reviews,
  z_mock_reviews,
  z_mock_reviews_photos
} = require('../index.js');

console.log(
  'db', db,
  'dbName', dbName,
  'characteristics:', characteristics,
  'characteristics_reviews:', characteristics_reviews,
  'reviews:', reviews,
  'reviews_photos:', reviews_photos,
  'z_mock_characteristics:', z_mock_characteristics,
  'z_mock_characteristic_reviews:', z_mock_characteristic_reviews,
  'z_mock_reviews', z_mock_reviews,
  'z_mock_reviews_photos', z_mock_reviews_photos
  );

// EXECUTE THESE TRANSFORMATIONS IN SEQUENCE IN THE COMMAND LINE TO CREATE THE "GET reviews" ENDPOINT.

addPhotoFieldWithSubfieldsAndData() {
  db.z_mock_reviews.aggregate([
    {
      $lookup: {
        from: 'z_mock_reviews_photos',
        localField: 'id',
        foreignField: 'review_id',
        as: 'photos'
      }
    },
    {
      $addFields: {
        "date": { $toDate : "$date" }
      }
    },
    {
      $out:  "mergedreviewstest"
    }
  ]).explain("executionStats")
}

renameProductIDToProduct() {
  db.mergedreviewstest.updateMany(
    {},
    { $rename: {"product_id": "product"} }
  )
}

addResultsField() {
  db.mergedreviewstest.aggregate([
    {
      $addFields: {
        "results" : [],
      }
    },
    {
      $out: "mergedreviewstest"
    }
  ])
}

addFieldsToResultsField() {
  db.mergedreviewstest.updateMany(
    {},
    {
      $push: {
        results: {
          "review_id": "",
          "rating": "",
          "summary": "",
          "recommend": "",
          "response": "",
          "body": "",
          "date": "",
          "reviewer_name": "",
          "helpfulness": "",
          "photos": ""
        }
      }
    }
  )
}

outputToNewTable() {
  db.mergedreviewstest.aggregate([
    {
      $out: "mergedreviewstest"
    }
  ])
}

updateReviewID() {
  db.mergedreviewstest.aggregate([
    {
      $set: {
        "results.review_id" : "$id",
        "results.rating": "$rating",
        "results.summary": "$summary",
        "results.recommend": "$recommend",
        "results.reported": "$reported",
        "results.response": "$response",
        "results.body": "$body",
        "results.date": "$date",
        "results.reviewer_name": "$reviewer_name",
        "results.reviewer_email": "$reviewer_email",
        "results.helpfulness": "$helpfulness",
        "results.photos": "$photos"
      }
    },
    {
      $unset: [
        "id",
        "rating",
        "summary",
        "recommend",
        "reported",
        "response",
        "body",
        "date",
        "reviewer_name",
        "reviewer_email",
        "helpfulness",
        "photos"
      ]
    },
    {
      $out: "mergedreviewstest"
    }
  ])
}

// EXECUTE THESE TRANSFORMATIONS IN SEQUENCE IN THE COMMAND LINE TO CREATE THE "GET reviews/meta" ENDPOINT.

groupProductReviewsByEachReviewID() {
  db.z_mock_reviews.aggregate([
    {
      $group: {
        _id: "$id",
        reviewInfo: {
          $addToSet: {
            product_id: "$product_id",
            rating: "$rating",
            recommend: "$recommend"
          }
        }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $merge: {
        into: "mergedreviewsmetatest",
        on: "_id",
        whenMatched: "replace",
        whenNotMatched: "insert"
      }
    },
  ])
}

getChacracteristicIDAndValueForEachReview() {
  db.z_mock_characteristic_reviews.aggregate([
    {
      $group: {
        _id: "$review_id",
        characteristics: {
          $addToSet: {
            characteristic_id: "$characteristic_id",
            value: "$value"
          }
        }
      }
    },
    {
      $out: "test"
    }
  ])
}

linkCharacteristicIDAndValueFieldsToReviewInfoForEachReview() {
  db.mergedreviewsmetatest.aggregate([
    {
      $addFields: {
        product_id: "$reviewInfo.product_id"
      }
    },
    {
      $unwind: "$product_id"
    },
    {
      $addFields: {
        rating: "$reviewInfo.rating"
      }
    },
    {
      $unwind: "$rating"
    },
    {
      $addFields: {
        recommend: "$reviewInfo.recommend"
      }
    },
    {
      $unwind: "$recommend"
    },
    {
      $unset: 'reviewInfo'
    },
    {
      $lookup: {
        from: "test",
        localField: "_id",
        foreignField: "_id",
        as: "characteristicIdsAndValues"
      }
    },
    {
      $unwind: '$characteristicIdsAndValues'
    },
    {
      $unset: 'characteristicIdsAndValues._id'
    },
    {
      $sort: {_id: 1}
    },
    {
      $out: "mergedreviewsmetatest"
    }
  ])
}

addProductCharacteristicToReview() {
  db.mergedreviewsmetatest.aggregate([
    {
      $lookup: {
        from: "z_mock_characteristics",
        localField: "product_id",
        foreignField: "product_id",
        as: "name"
      }
    },
    {
      $out: "mergedreviewsmetatest"
    }
  ])
}

// KEEP THESE FIELDS FOR LATER AFTER SCHOOL IN ORDER TO GET THE DATA IN THE RIGHT FORM, DO NOT EXECUTE UNTIL THEN.

addBreakdownFields() {
  db.mergedreviewsmetatest3.aggregate([
    {
      $addFields: {
        "recommended": [],
        "ratings": []
      }
    },
    {
      $out: "mergedreviewsmetatest4"
    }
  ])
}

fillOutBreakdownFields() {
  db.mergedreviewsmetatest4.updateMany(
    {},
    {
      $push: {
        "recommended": {
          "false": 0,
          "true": 0,
        },
        "ratings": {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0
        }
      }
    }
  )
}

// STILL NEED TO...

// 1. Group the characteristic.id and characteristic.value properties to come in underneath the characteristic.name property properly. -> Start up server in front end and do a Postman request for a low product number to get mock data on this relationship that you can draw from your four CSV files. - MONGDB

// 2. Count the number of true recommendations for each product.  True = 1, False = 1. - MONGODB


// 3. Count the number of ratings at each start count for each product. - SERVER ENDPOINT
