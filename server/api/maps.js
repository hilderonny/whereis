var router = require('express').Router();

/**
 * Send the API KEY defined in the environment variable GOOGLE_MAPS_APIKEY.
 * Used by client to lazy load the map.
 */
router.get('/apikey', (req, res) => {
    res.send(process.env.GOOGLE_MAPS_APIKEY);
});

module.exports = router;
