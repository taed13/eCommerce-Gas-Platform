
const instanceMysql = require("../dbs/init.mysql2");
const Book = require("../models/book.model");

const sequelize = instanceMysql.getSequelize();

sequelize.sync().then(() => {

    Book.findOne({
        where: {
            id: "1"
        }
    }).then(res => {
        console.log(res)
    }).catch((error) => {
        console.error('Failed to retrieve data : ', error);
    });

}).catch((error) => {
    console.error('Unable to create table : ', error);
});