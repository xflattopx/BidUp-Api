const dotenv = require('dotenv');
const { Pool } = require('pg');

const envFile = process.env.NODE_ENV === 'development' ? '.env.development' : `.env.${process.env.NODE_ENV || 'local'}`;
dotenv.config({ path: envFile });
console.log(process.env.HOST)

const pool = new Pool({

    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});


module.exports = pool;
