const mongoose = require("mongoose");
require('dotenv').config();
const uri = process.env.MONGO_URL;
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
  };
mongoose.connect(uri, options)
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB', error);
  });
const mySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        
        trim: true,
        maxLength: 50
    }
})

const accountSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    balance:{
        type:Number,
        required:true
    }
})

const Account = mongoose.model(
    'Account',accountSchema
)

const User = mongoose.model('User',mySchema);

module.exports = {
    User,
    Account,
}