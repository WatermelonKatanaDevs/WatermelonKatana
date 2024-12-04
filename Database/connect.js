const Mongoose = require("mongoose");
Mongoose.set('strictQuery',true);

const uri = process.env.MONGODB_PASSWORD;

const connectDB = async () => {
  await Mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB Connected.');
};

module.exports = connectDB;