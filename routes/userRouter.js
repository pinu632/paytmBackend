const express = require('express');
const UserRoutes= express.Router();
const zod = require('zod');
const {User,Account} = require('../db')
const jwt = require('jsonwebtoken');
const JWT_SECRET=require('../config');
const bodyParser = require('body-parser');
const {authMiddleware}=require("../middleware");
UserRoutes.use(bodyParser.json());

const signupSchema = zod.object({
    username:zod.string().email(),
    password:zod.string(),
    firstName:zod.string(),
    lastName:zod.string(),
})

UserRoutes.post('/signup', async (req, res) => {
    const body = req.body;
    const { success } = signupSchema.safeParse(req.body);
    console.log(success);
   
    if (!success) {
        return res.json({
            msg: "User already taken/Incorrect inputs"
        });
    }

    try {
        const user = await User.findOne({ username: body.username });

        if (user) {
            return res.json({
                msg: "Email already taken"
            });
        }

        const dbUser = await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            password: req.body.password,
           

        });

        
        const userId = dbUser._id;
        await Account.create({
            userId,
            balance: 1 + Math.random() * 10000
        });

        const token = jwt.sign({ userId }, JWT_SECRET);

        res.json({
            msg: "User created successfully",
            token: token,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});


const signinBody = zod.object({
    username:zod.string().email(),
    password: zod.string()
})


UserRoutes.post("/signIn",async (req,res)=>{
    const {success} = signinBody.safeParse(req.body);
    if(!success)
    {
        return res.status(411).json({
            msg:"email already taken/incorrect inputs"
        })
    }


    const user =await User.findOne({
        username:req.body.username,
        password:req.body.password

    })

    if(user){
        const token = jwt.sign({
            userId:user._id
        },JWT_SECRET);
        res.json({
            token: token
        })
        return;
    }

    res.json({
        msg:"error while signin"
    })
   

})

const updateBody = zod.object({
    password:zod.string().optional(),
    firstname:zod.string().optional(),
    lastname:zod.string().optional()
})

UserRoutes.put('/updateUser', authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            msg: "Error while updating information"
        });
    }

    try {
        await User.updateOne({ _id: req.userId }, req.body); // Corrected the updateOne() method usage
        res.json({
            msg: "Updated successfully"
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});


UserRoutes.get("/bulk", async (req, res) => {
    try {
        const filter = req.query.filter || "";

        const users = await User.find({
            $or: [{
                firstName: {
                    "$regex": filter
                }
            }, {
                lastName: {
                    "$regex": filter
                }
            }]
        });

        res.json({
            users: users.map(user => ({
                username: user.username,
                firstname: user.firstName,
                lastname: user.lastName,
                _id: user._id
            }))
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
});





module.exports=UserRoutes;

