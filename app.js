var express = require('express');

var app = express();
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/client/html'));

app.listen(port, function() {
    console.log(`Application is running on port ${port}`);
});
