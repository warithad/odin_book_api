const mongoose = require('mongoose')

const mongodbUri = process.env.MONGODB_URI;

async function intializeMongoDb(){
    await mongoose.connect(mongodbUri, {useNewUrlParser: true});

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'mongo connection error'))
}

exports.module = intializeMongoDb;