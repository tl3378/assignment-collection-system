const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // 如果设置了 USE_MEMORY_DB 环境变量为 true，则使用内存数据库
    if (process.env.USE_MEMORY_DB === 'true') {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`);
      return;
    }
    
    // 否则尝试连接到 MONGO_URI
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
