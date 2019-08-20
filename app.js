//require('./config/config');
const express = require('express');
var bodyParser = require('body-parser')
let app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    console.info(req.method + ' ' + req.originalUrl);
    console.log(req.method + ' ' + req.originalUrl);
    next();
});
app.use(bodyParser.json())
// Import routes
require('./routes')(app);


const port = 3000;

app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
})

/*    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method,, Authorization");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header("Allow: GET, POST, OPTIONS, PUT, DELETE");*/
