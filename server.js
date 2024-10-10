const app = require("./src/app");

const PORT = process.env.PORT || 3056;

const server = app.listen(PORT, () => {
    console.log(`WSV eCommerce API is running on port ${PORT}`);
});

process.on("SIGINT", () => {
    server.close(() => {
        console.log("WSV eCommerce API is shutting down");
        process.exit(0);
    });
});