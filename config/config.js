var env = process.env.NODE_ENV || 'test';

if (env === 'development' || env === 'test' || env === 'production') {
  var config = require('./config.json');
  var envConfig = config[env];
 /* var envConfig2 = config["test"];
  console.log(envConfig2["customer"]);*/
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}