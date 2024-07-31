const JWT_SECRET=require("./config");
const jwt = require('jsonwebtoken');

const authMiddleware=(req,res,next)=>{
    const authHeader=req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(403).json({});
    }

    const token = authHeader.split(' ')[1];
    console.log(token);

    try{
        jwt.verify(token,JWT_SECRET,{ algorithms: ['HS256'] }, (err, decoded) => {
            if (err) {
                // Token verification failed
                return res.status(401).json({ message: 'Unauthorized' });
            } else {
                // Token is valid, proceed with the request
                req.userId = decoded.userId;
                next();
            }
        });
    } catch(err){
        return res.status(403).json({msg:"it not running"});
    }
}
module.exports={
    authMiddleware
}