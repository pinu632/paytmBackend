const express =require("express");
const app=express();
const mainRouter = require('./routes/index');
const cors=require('cors');

const PORT = process.env.PORT;

app.use(cors());

app.use("/api/v1",mainRouter);
app.listen(PORT,()=>{
    console.log("server started at port 3000");
});
