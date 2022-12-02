const mongoose = require('mongoose');
const timeslotSchema = require('../../helpers/schemas/timeslot')

// Variables
//const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://' + config.appointmentUser.name + ':' + config.appointmentUser.password + '@cluster0.lj881zv.mongodb.net/?retryWrites=true&w=majority';
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/UserDB';

// Connect to MongoDB
const mongooseClient = mongoose.createConnection(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}, function (err) {
    if (err) {
        console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
        console.error(err.stack);
        process.exit(1);
    }
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
})

// Model creation
const timeSlotModel = mongooseClient.model('timeslot', timeslotSchema)