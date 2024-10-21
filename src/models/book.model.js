
const { DataTypes } = require("sequelize");
const instanceMysql = require("../dbs/init.mysql2");

const sequelize = instanceMysql.getSequelize();

const Book = sequelize.define("Book", {
    title: {
        type: DataTypes.STRING,
        alowNull: false,
    },
    author: {
        type: DataTypes.STRING,
        alowNull: false,
    },
    release_date: {
        type: DataTypes.DATEONLY,
        alowNull: false,
    },
    subject: {
        type: DataTypes.INTEGER,
    }
}, {
    tableName: "books",
    timestamps: false,
});

sequelize.sync().then(() => {
    console.log('Book table created successfully!');

    Book.create({
        title: "Clean Code",
        author: "Robert Cecil Martin",
        release_date: "2021-12-14",
        subject: 3
    }).then(res => {
        console.log(res)
    }).catch((error) => {
        console.error('Failed to create a new record : ', error);
    });
}).catch((error) => {
    console.error('Unable to create table : ', error);
});

module.exports = Book;