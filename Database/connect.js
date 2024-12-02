const Mongoose = require("mongoose");
const { Logger } = require('../util/logger');
Mongoose.set('strictQuery',true);

const uri ="mongodb+srv://dragonfire7z:"+process.env.MONGODB_PASSWORD+"@picmo.ti6ffzg.mongodb.net/?retryWrites=true&w=majority";

const connectDB = async () => {
  await Mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  Logger.info("Database Connected");
};

module.exports = connectDB;