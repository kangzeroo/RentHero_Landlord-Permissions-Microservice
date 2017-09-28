var config = {
development: {
    //url to be used in link generation
    //url: 'http://my.site.com',
    //mongodb connection settings
    postgres: {
        user: 'rentburrowAdmin', //env var: PGUSER
        database: 'mydb', //env var: PGDATABASE
        password: 'bobothebun', //env var: PGPASSWORD
        host: 'rentburrowdev.cg1nfg9jwupv.us-east-1.rds.amazonaws.com', // Server hosting the postgres database
        port: 5432
    }
},
production: {
    postgres: {
        user: 'randytheferret', //env var: PGUSER
        database: 'RentburrowProdV3', //env var: PGDATABASE
        password: 'bobothebun', //env var: PGPASSWORD
        host: 'rentburrowprodv3.cg1nfg9jwupv.us-east-1.rds.amazonaws.com', // Server hosting the postgres database
        port: 5432
    }
}
};
module.exports = config;
