const express = require('express');

let app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    console.info(req.method + ' ' + req.originalUrl);
    console.log(req.method + ' ' + req.originalUrl);
    next();
});

// Import routes
require('./routes')(app);

const port = process.env.PORT || 3000;

app.set('trust proxy', true);

app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
})
