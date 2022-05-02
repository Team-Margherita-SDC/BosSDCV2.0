// EXECUTE THESE TRANSFORMATIONS IN SEQUENCE IN THE COMMAND LINE TO CREATE THE "GET reviews" ENDPOINT.

// addPhotoFieldWithSubfieldsAndData
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

// renameProductIDToProduct
  db.mergedreviewstest.updateMany(
    {},
    { $rename: {"product_id": "product"} }
  )

// addResultsField
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

// addFieldsToResultsField
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

// outputToNewTable
  db.mergedreviewstest.aggregate([
    {
      $out: "mergedreviewstest"
    }
  ])

// updateReviewID
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

// EXECUTE THESE TRANSFORMATIONS IN SEQUENCE IN THE COMMAND LINE TO CREATE THE "GET reviews/meta" ENDPOINT.

// groupProductReviewsByEachReviewID
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
        whenNotMatched: "discard"
      }
    },
  ])

// getChacracteristicIDAndValueForEachReview
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

// linkCharacteristicIDAndValueFieldsToReviewInfoForEachReview
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

// addProductCharacteristicToReview
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

// removeUnnecessaryFields
  db.mergedreviewsmetatest.aggregate([
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
      $out: "mergedreviewsmetatest"
    }
  ])