const express = require('express');
const userRouter = require('./userRouter');
const AccountRouter = require('./account');

const router = express.Router();

router.use('/user',userRouter);
router.use("/account",AccountRouter);

module.exports = router;