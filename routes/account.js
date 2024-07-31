const express= require('express');
const {authMiddleware}=require("../middleware");
const mongoose=require('mongoose');
const {Account}=require('../db');
const bodyParser=require('body-parser');
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


const AccountRouter = express.Router();
AccountRouter.use(bodyParser.json());

AccountRouter.get('/balance',authMiddleware,async (req,res)=>{
    const account = await Account.findOne({
        userId:req.userId
    });
    console.log(account);

    res.json({
        balance:account.balance,
    })

});

AccountRouter.post('/transfer',authMiddleware,async(req,res)=>
{
    const session = await mongoose.startSession();
    session.startTransaction();
    const {amount,to} = req.body;

    const account = await Account.findOne({userId:req.userId}).session(session);

    if(!account || account.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    const toAccount = await Account.findOne({
        userId:to
    }).session(session);

    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            message:"invalid avvount"
        });
    }

    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    await session.commitTransaction();
    res.json({
        message:"transfer successful"
    });


});

module.exports = AccountRouter;