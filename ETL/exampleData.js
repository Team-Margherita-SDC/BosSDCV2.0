// GET reviews....

{
  "product": "2",
  "page": 0,
  "count": 5,
  "results": [
    {
      "review_id": 5,
      "rating": 3,
      "summary": "I'm enjoying wearing these shades",
      "recommend": false,
      "response": null,
      "body": "Comfortable and practical.",
      "date": "2019-04-14T00:00:00.000Z",
      "reviewer_name": "shortandsweeet",
      "helpfulness": 5,
      "photos": [{
          "id": 1,
          "url": "urlplaceholder/review_5_photo_number_1.jpg"
        },
        {
          "id": 2,
          "url": "urlplaceholder/review_5_photo_number_2.jpg"
        },
        // ...
      ]
    },
    {
      "review_id": 3,
      "rating": 4,
      "summary": "I am liking these glasses",
      "recommend": false,
      "response": "Glad you're enjoying the product!",
      "body": "They are very dark. But that's good because I'm in very sunny spots",
      "date": "2019-06-23T00:00:00.000Z",
      "reviewer_name": "bigbrotherbenjamin",
      "helpfulness": 5,
      "photos": [],
    },
    // ...
  ]
}

// GET /reviews/meta...

{
  "product_id": "2",
  "ratings": {
    2: 1,
    3: 1,
    4: 2,
    // ...
  },
  "recommended": {
    0: 5
    // ...
  },
  "characteristics": {
    "Size": {
      "id": 14,
      "value": "4.0000"
    },
    "Width": {
      "id": 15,
      "value": "3.5000"
    },
    "Comfort": {
      "id": 16,
      "value": "4.0000"
    },
    // ...
}

// PUT /reviews/:review_id/helpful...

"helpful": true

// PUT /reviews/:review_id/report...

"reported": true

// TERMINAL COMMANDS FOR MONGODUMP, MONGORESTORE, AND AWS DEPLOYMENT

// '/reviews' endpoint data, mongodump
mongodump --uri="mongodb://127.0.0.1:27017" --db=ratingsandreviews --collection=mergedreviews -o /Users/robertczajka/Documents/Hack\ Reactor/Programming\ Files/Better\ System\ Design\ Capstone/BosSDCV2.0/AmazonDeployment

// '/reviews' endpoint data, mongorestore
mongorestore --verbose --uri="mongodb://127.0.0.1:27017" /Users/robertczajka/Documents/Hack\ Reactor/Programming\ Files/Better\ System\ Design\ Capstone/BosSDCV2.0/AmazonDeployment/ratingsandreviews

// '/reviews/metas' endpoint data, mongodump
mongodump --uri="mongodb://127.0.0.1:27017" --db=ratingsandreviews --collection=mergedreviewsmetas -o /Users/robertczajka/Documents/Hack\ Reactor/Programming\ Files/Better\ System\ Design\ Capstone/BosSDCV2.0/AmazonDeployment

// SCP for database dump transfer from local machine to AWS instance
scp -i SystemDesignCapstone.pem ./ratingsandreviews/mergedreviews.bson ubuntu@ec2-3-82-103-134.compute-1.amazonaws.com:
scp -i SystemDesignCapstone.pem ./ratingsandreviews/mergedreviewsmetas.bson ubuntu@ec2-3-82-103-134.compute-1.amazonaws.com:~/