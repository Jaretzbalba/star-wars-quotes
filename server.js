const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;

let connectionString = `mongodb+srv://Jaret:9Dh7rkZB30H6T0jI@cluster0.gpzp2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    const db = client.db('star-wars-quotes');
    const quotesCollection = db.collection('quotes');

    // ========================
    // Middlewares
    // ========================
    app.set('view engine', 'ejs');
    // Make sure you place body-parser before your CRUD handlers!
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('public'));
    app.use(bodyParser.json());

    // ========================
    // Routes
    // ========================
    app.get('/', (req, res) => {
      quotesCollection
        .find()
        .toArray()
        .then(quotes => {
          res.render('index.ejs', { quotes: quotes });
        })
        .catch(error => console.error(error));
    });

    app.post('/quotes', (req, res) => {
      quotesCollection
        .insertOne(req.body)
        .then(result => {
          res.redirect('/');
        })
        .catch(error => console.error(error));
    });

    app.put('/quotes', (req, res) => {
      quotesCollection
        .findOneAndUpdate(
          { name: 'Yoda' },
          {
            $set: {
              name: req.body.name,
              quote: req.body.quote,
            },
          },
          {
            upsert: true,
          }
        )
        .then(result => res.json('Success'))
        .catch(error => console.error(error));
    });

    app.delete('/quotes', (req, res) => {
      if (req.body.name === 'Darth Vadar') {
        quotesCollection
          .deleteOne({ name: req.body.name })
          .then(result => {
            if (result.deletedCount === 0) {
              return res.json('No quote to delete');
            }
            res.json(`Deleted Darth Vadar's quote`);
          })
          .catch(error => console.error(error));
      } else {
        quotesCollection
          .deleteMany({})
          .then(result => {
            if (result.deletedCount === 0) {
              return res.json('No quotes to delete');
            }
            res.json(`All quotes destroyed!`);
          })
          .catch(error => console.error(error));
      }
    });

    // app.delete('/quotes', (req, res) => {
    //   quotesCollection
    //     .deleteMany({})
    //     .then(result => {
    //       if (result.deletedCount === 0) {
    //         return res.json('No quotes to delete');
    //       }
    //       res.json(`All quotes destoryed!`);
    //     })
    //     .catch(error => console.error(error));
    // });

    // ========================
    // Listen
    // ========================
    app.listen(3000, function () {
      console.log('listening on 3000');
    });
  })
  .catch(console.error);
