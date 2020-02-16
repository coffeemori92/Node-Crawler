import Sequelize from 'sequelize';
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.Facebook = require('./facebook')(sequelize, Sequelize);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;