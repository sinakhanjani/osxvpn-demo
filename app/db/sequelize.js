const { Sequelize } = require('sequelize');
require('dotenv').config()
const config = require('config')
const env = config.get('env')

// https://sequelize.org/docs/v6/getting-started/

const sequelize = new Sequelize("", {
    host: "",
    dialect: 'postgres'/* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
})

// // // const sequelize = new Sequelize(env.NEON_POSGRESQL_DATABASE)

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.')
}).catch((error) => {
    console.error('Unable to connect to the database:', error)
})

module.exports = sequelize

// https://dev.to/nedsoft/add-new-fields-to-existing-sequelize-migration-3527