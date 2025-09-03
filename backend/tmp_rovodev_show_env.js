require('dotenv').config({ path: __dirname + '/.env' });
console.log('DB_HOST=', process.env.DB_HOST);
console.log('DB_USER=', process.env.DB_USER);
console.log('DB_PASSWORD=', process.env.DB_PASSWORD ? '<set>' : '<empty>');
console.log('DB_NAME=', process.env.DB_NAME);
