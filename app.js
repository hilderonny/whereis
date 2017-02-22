var express = require('express');
var MongoClient = require('mongodb').MongoClient;

var app = express();
var port = process.env.PORT || 5000;
var dbUri = process.env.MONGODB_URI || 'mongodb://localhost/whereis';

// http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connection-pooling
// Initialize database connection before starting the app
MongoClient.connect(dbUri, (err, db) => {
    if(err) throw err;
    // Store db connection in request object req.db
    app.use((req, res, next) => {
        req.db = db;
        next();
    });
    // Seed database
    db.collection('markers').deleteMany().then((result) => {
        var markers = [
            { name: 'Marker 1' },
            { name: 'Marker 2' }
        ]
        db.collection('markers').insertMany(markers);
    });

    // A call to /db returns a list of all markers in the database
    app.get('/db', function(req, res) {
        req.db.collection('markers').find().toArray((err, docs) => {
            res.send(docs);
        });
    });

    // Add API's
    app.use('/api/maps', require('./server/api/maps'));

    // Server static content
    app.use(express.static(__dirname + '/client/html'));
    app.use('/js/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
    
    // Start application
    app.listen(port, function() {
        console.log(`Application is running on port ${port}`);
    });
});
