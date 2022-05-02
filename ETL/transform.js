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
  db.reviews.aggregate([
    {
      $lookup: {
        from: 'reviews_photos',
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
      $out:  "mergedreviews"
    }
  ])
}

renameProductIDToProduct() {
  db.mergedreviews.updateMany(
    {},
    { $rename: {"product_id": "product"} }
  )
}

addResultsField() {
  db.mergedreviews.aggregate([
    {
      $addFields: {
        "results" : [],
      }
    },
    {
      $out: "mergedreviews"
    }
  ])
}

addFieldsToResultsField() {
  db.mergedreviews.updateMany(
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
  db.mergedreviews.aggregate([
    {
      $out: "mergedreviews"
    }
  ])
}

updateReviewID() {
  db.mergedreviews.aggregate([
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
      $out: "mergedreviews"
    }
  ])
}

// EXECUTE THESE TRANSFORMATIONS IN SEQUENCE IN THE COMMAND LINE TO CREATE THE "GET reviews/meta" ENDPOINT.

groupProductReviewsByEachReviewID() {
  db.reviews.aggregate([
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
        into: "mergedreviewsmetas",
        on: "_id",
        whenMatched: "replace",
        whenNotMatched: "discard"
      }
    },
  ],
  {
    allowDiskUse: true
  })
}

getChacracteristicIDAndValueForEachReview() {
  db.characteristic_reviews.aggregate([
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
      $out: "finaltest"
    }
  ],
  {
    allowDiskUse: true
  })
}

linkCharacteristicIDAndValueFieldsToReviewInfoForEachReview() {
  db.mergedreviewsmetas.aggregate([
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
        from: "finaltest",
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
      $out: "mergedreviewsmetas"
    }
  ],
  {
    allowDiskUse: true
  })
}

addProductCharacteristicToReview() {
  db.mergedreviewsmetas.aggregate([
    {
      $lookup: {
        from: "characteristics",
        localField: "product_id",
        foreignField: "product_id",
        as: "name"
      }
    },
    {
      $out: "mergedreviewsmetas"
    }
  ],
  {
    allowDiskUse: true
  })
}

removeUnnecessaryFields() {
  db.mergedreviewsmetas.aggregate([
    {
      $addFields: {
        chars: "$characteristicIdsAndValues.characteristics"
      }
    },
    {
      $sort: {"name.id": 1}
    },
    { $set:
      { "chars":
        { $function: {
            body: function(chars) { return chars.sort((a, b) => a.characteristic_id > b.characteristic_id); },
            args: ["$chars"],
            lang: "js"
        }}
      }
    },
    {
      $unset: ["characteristics", "characteristicIdsAndValues", "name._id", "name.product_id"]
    },
    {
      $out: "mergedreviewsmetas"
    }
  ],
  {
    allowDiskUse: true
  })
}