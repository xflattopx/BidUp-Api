const pg = require('pg');
const { Connector } = require('@google-cloud/cloud-sql-connector');
let pool;
let clientOpts;
async function main() {
    if(process.env.ENV_NODE === 'development'){
    const connector = new Connector();
    clientOpts = (async) => connector.getOptions({
        instanceConnectionName: 'bidup-405619:us-east1:postgres',
        ipType: 'PUBLIC',
    });
}
    pool = new pg.Pool({
        ...clientOpts,
        user: process.env.DB_USER || 'time_user',
        host: process.env.DB_HOST ||  'localhost',//'/cloudsql/bidup-405619:us-east1:postgres/.s.PGSQL.5432',
        database: process.env.DB_DATABASE || 'time_db',
        password: process.env.DB_PASSWORD || 'time_password',
        port: process.env.DB_PORT || 5432,
        max: 5,
    });

    return pool;

}
module.exports = pool

// Execute the main function
main().catch(error => console.error('Error during database connection:', error));
