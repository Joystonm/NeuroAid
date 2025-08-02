const { MongoClient } = require('mongodb');

async function checkMongoDB() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    console.log('🔄 Checking MongoDB connection...');
    await client.connect();
    console.log('✅ MongoDB is running and accessible!');
    
    const admin = client.db().admin();
    const result = await admin.ping();
    console.log('🏓 Ping successful:', result);
    
    const databases = await admin.listDatabases();
    console.log('📊 Available databases:');
    databases.databases.forEach(db => {
      console.log(`   - ${db.name}`);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n💡 To fix this:');
    console.log('1. Make sure MongoDB is installed');
    console.log('2. Start MongoDB service:');
    console.log('   Windows: net start MongoDB');
    console.log('   macOS: brew services start mongodb-community');
    console.log('   Linux: sudo systemctl start mongod');
    console.log('3. Check if port 27017 is available');
  } finally {
    await client.close();
  }
}

checkMongoDB();
