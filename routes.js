let path = require('path');

module.exports = function (app) {
    //Basic routes
    app.use('/API', require('./API'));
    

    // // All undefined asset or api routes should return a 404
    // app.route('/:url(app|assets|components|lib)/*')
    //     .get(error[404]);
    //
    //
    // //All unresolved routes redirect to index
    // app.route('/*')
    //     .get(function (req, res) {
    //         res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    //     });
};