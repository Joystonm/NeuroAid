const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI not found in environment variables');
      console.log('🔧 Using default: mongodb://localhost:27017/neuroaid');
      process.env.MONGODB_URI = 'mongodb://localhost:27017/neuroaid';
    }

    console.log(`🔄 Attempting to connect to MongoDB...`);
    console.log(`📍 URI: ${process.env.MONGODB_URI}`);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('💡 Make sure MongoDB is running on your system');
    console.log('🔧 To start MongoDB:');
    console.log('   Windows: net start MongoDB');
    console.log('   macOS: brew services start mongodb-community');
    console.log('   Linux: sudo systemctl start mongod');
    
    // Don't exit the process, let the app run without database
    console.log('⚠️  Continuing without database connection...');
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed through app termination');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
  }
  process.exit(0);
});

module.exports = connectDB;
