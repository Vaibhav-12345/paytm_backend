// typescrpt me hum desctructre kar ke { Router} ko nikalte the aise from 'express'
const express = require("express");
const userRouter = express.Router();

// bcrypt we hash the password
// const bcrypt = require('bcrypt');

// jwt jsonwebtoken for auth
const jwt = require("jsonwebtoken");
const jwt_secret_key = process.env.JWT_SECRET_KEY;

// input validation we use zod
const { z } = require("zod");
const { userModel, Account } = require("../db");
const userMiddelware = require("../middelware");

// make zod schema
const zodSchema = z.object({
  username: z.string().email(),
  password: z.string().min(4),
  firstName: z.string(),
  lastName: z.string(),
});

userRouter.post("/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  const inputValidationCheck = zodSchema.safeParse(req.body);

  if (!inputValidationCheck.success) {
    return res.json({
      message: "Invalid Credential",
      error: inputValidationCheck.error.issues[0].message,
    });
  }

  const existinguser = await userModel.findOne({
    username,
  });

  if (existinguser) {
    return res.json({
      message: "email already exist",
    });
  }

  // const hashpassword=await bcrypt.hash(password,10)

  const user=await userModel.create({
    username: username,
    password: password,
    firstName: firstName,
    lastName: lastName,
  });

  const userId=user._id;

  // - - - - - crate new account - - - - - -

  await Account.create({
    userId:userId,
    balance:Math.random()*10000 +1
  })


  res.json({
    message: "user signup successfull",
  });
});

userRouter.post("/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const existingUser=await userModel.findOne({
      username
  })

  if (!existingUser) {
    return res.status(404).json({
      message: "User not found, please sign up first.",
    });
  }

  let token = jwt.sign({ userId: existingUser._id }, jwt_secret_key);
  req.header("token", token);

  res.json({
    message: "user signin successfull",
    token: token,
  });
});

// userRouter.get("/bulk", userMiddelware, async (req, res) => {
//   const userAll = await userModel.find({});
//   res.json({
//     message: userAll,
//   });
// });

// ---------------------------------------

// update user

const updateBody = z.object({
  password: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// update each individual user
userRouter.put("/", userMiddelware, async (req, res) => {
  const current_userId = req.userId;
  const newPassword = req.body.password;

  const { success } = updateBody.safeParse(req.body);

  if (!success) {
    return res.status(403).json({
      message: "Invalid password format",
    });
  }

  await userModel.updateOne(
    { _id: current_userId },
    { $set: { password: newPassword } }
  );

  res.status(200).json({
    message: "Password updated successfully",
  });
});

// route to get users from backend,filterable via fistname/lastname using regex 
// we same thing done in sql : select * from emp where name like "%har% 

// all users get 
userRouter.get("/bulk", userMiddelware, async (req, res) => {

    const users = await userModel.find({
  _id: { $ne: req.userId }
});


   const filter = req.query.filter || "";

    const filter_user = await userModel.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
});

// typscript me hum direct export karte the userRouter ko
module.exports = {
  userRouter: userRouter,
};
