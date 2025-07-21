const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
      });
      console.log(`MongoDB Connected:`);
      return conn.connection;
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }

  module.exports = connectDB;