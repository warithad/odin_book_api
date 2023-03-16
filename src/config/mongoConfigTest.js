const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function intializeMongoMemoryServer(){
    const server = await MongoMemoryServer.create();
    const uri = server.getUri();
    mongoose.set('strictQuery', false);
    
    mongoose.connect(uri);
    mongoose.connection.on('error', (e) => {
        if(e.message.code === 'ETIMEDOUT'){
            console.log(e.message);
            mongoose.connect(uri);
        }
        console.log(e);
    })

    mongoose.connection.once('open', () => {
        console.log(`Mongodb successfully connected to ${uri}`);
    })
}

module.exports = intializeMongoMemoryServer;