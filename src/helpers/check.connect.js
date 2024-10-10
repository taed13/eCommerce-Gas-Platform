"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 5000;

// Count connection
const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log("Number of connections: ", numConnection);
};

// Check over load
const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss / 1024 / 1024;

        // Example maximum number of connections based on number of cores
        const maxConnections = numCores * 5;

        console.log(`Active connections: ${numConnection}`);
        console.log(`Memory usage: ${memoryUsage} MB`);

        if (numConnection > maxConnections) {
            console.log("Connection overload");
        }
    }, _SECONDS); // Monitor every 5 seconds
};

module.exports = {
    countConnect
};