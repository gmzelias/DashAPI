module.exports = {
  apps : [{
    name: 'API',
    script: 'app.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: 'one two',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

 /* deploy : {
    production : {
      user : 'ubuntu',
      host : 'ec2-18-237-86-164.us-west-2.compute.amazonaws.com',
      key: 'C:/Users/gmzel/Desktop/PaymentProcessor.pem',
      ref  : 'origin/master',
      repo : 'https://github.com/gmzelias/DashAPI.git',
      path : '/home/ubuntu/Code/DashAPI',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }*/

  deploy : {
    production : {
      user : 'bitnami',
      host : 'ec2-34-216-219-84.us-west-2.compute.amazonaws.com',
      key  : 'C:/Users/gmzel/Desktop/wordpress-DHV.pem',
      ref  : 'origin/master',
      repo : 'https://github.com/gmzelias/DashAPI.git',
      path : '/home/bitnami/apps/DashAPI',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};