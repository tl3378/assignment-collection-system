const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let dbUrl;
    
    // 生产环境使用环境变量中的MongoDB URI
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI environment variable is not defined');
      }
      dbUrl = process.env.MONGO_URI;
      await mongoose.connect(dbUrl);
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } 
    // 开发环境使用内存数据库
    else {
      const mongod = await MongoMemoryServer.create();
      dbUrl = mongod.getUri();
      await mongoose.connect(dbUrl);
      console.log(`MongoDB Memory Server Connected: ${mongoose.connection.host}`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
