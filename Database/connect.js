const Mongoose = require("mongoose");
const { Logger } = require('../util/logger');
Mongoose.set('strictQuery',true);

const uri = process.env.MONGODB_PASSWORD;

const connectDB = async () => {
  await Mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  Logger.info("Database Connected");
};

module.exports = connectDB;