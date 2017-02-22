var router = require('express').Router();
var mongodb = require('mongodb');

/**
 * Send the API KEY defined in the environment variable GOOGLE_MAPS_APIKEY.
 * Used by client to lazy load the map.
 */
router.get('/apikey', (req, res) => {
    res.send(process.env.GOOGLE_MAPS_APIKEY);
});

/**
 * Get all markers in a defined region. Call with
 * /api/maps/LATITUDE1/LATITUDE2/LONGITUDE1/LONGITUDE2
 */
router.get('/:fromlat/:tolat/:fromlng/:tolng', (req, res) => {
    req.db.collection('markers').find({
        $and: [
            { lat: { $gte: parseFloat(req.params.fromlat) } },
            { lat: { $lte: parseFloat(req.params.tolat) } },
            { lng: { $gte: parseFloat(req.params.fromlng) } },
            { lng: { $lte: parseFloat(req.params.tolng) } }
        ]
    }).toArray((err, markers) => {
        res.send(markers);
    })
});

/**
 * Store a new marker in the database. Needed attributes: 
 * lat (decimal), lng (decimal), type (string)
 */
router.post('/', (req, res) => {
    req.db.collection('markers').insertOne(req.body, (err, result) => {
        res.send(result.insertedId);
    });
});

/**
 * Delete a marker with a given id.
 */
router.delete('/:id', (req, res) => {
    var id = new mongodb.ObjectID(req.params.id);
    req.db.collection('markers').remove({_id:id}, (err, result) => {
        res.sendStatus(200);
    });
});

module.exports = router;
