const mongoose = require("mongoose");
require("dotenv").config();

// defien the Mongobd conenction url
// const mongoURL = 'mongodb://127.0.0.1:27017/hotelsss'  //hotells is your database name
// const mongoURL = "mongodb+srv://nitinchugh4u:Nitin12345@cluster0.ele4y.mongodb.net/"
// const mongoURL = process.env.MONGODB_URL;
const mongoURL = process.env.MONGODB_URL_LOCAL


// mongoose.connect(mongoURL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.connect(mongoURL);





//get the default connection
// mongoose contain a default connection object representing the mongoDB connection
const db = mongoose.connection;

// dedfine event listener databse connection
db.on("connected", () => {
  console.log("Connected to the mongoDb server");
});
db.on("error", (err) => {
  console.error("MongoDb connection error", err);
});
db.on("disconnected", () => {
  console.log("MongoDb Discnnected");
});

// Exports the database connetion
module.exports = db;
