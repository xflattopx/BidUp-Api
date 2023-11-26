const pg = require('pg');
const { Connector } = require('@google-cloud/cloud-sql-connector');
let pool;
async function main() {
    const connector = new Connector();
    const clientOpts = await connector.getOptions({
        instanceConnectionName: 'bidup-405619:us-east1:postgres',
        ipType: 'PUBLIC',
    });
    pool = new pg.Pool({
        ...clientOpts,
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || '/cloudsql/bidup-405619:us-east1:postgres/.s.PGSQL.5432',
        database: process.env.DB_DATABASE || 'postgres',
        password: process.env.DB_PASSWORD || '1234',
        max: 5,
    });

    return pool;

}
module.exports = pool

// Execute the main function
main().catch(error => console.error('Error during database connection:', error));
