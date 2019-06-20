"use strict";

module.exports = {
    respondWithResults: (res, statusCode) => {
        statusCode = statusCode || 200;
        return (data) => {
            if (data) {
                res.status(statusCode).json(data);
            }
        }
    },
    errorHandler: (res, statusCode) => {
        statusCode = statusCode || 500;
        return function (err) {
            console.log(err);
            res.status(statusCode).send(err);
        };
    }
};