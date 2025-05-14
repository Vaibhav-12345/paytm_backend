const express = require("express");
const accountRouter = express.Router();

const mongoose = require("mongoose");

const { userModel, Account } = require("../db");
const userMiddelware = require("../middelware");




accountRouter.get("/balance", userMiddelware, async (req, res) => {
  const current_userId = req.userId;

    const account = await Account.findOne({
      userId: current_userId,
    });

    const user = await userModel.findOne({
      _id: current_userId,
    });


      res.json({
        balance: account.balance,
        name: user.firstName,
      });
    
  
});

accountRouter.post("/transfer", userMiddelware, async (req, res) => {
  const session = await mongoose.startSession();
  // start the transacation all query
  session.startTransaction();
  const current_userId = req.userId; // middelware se aayega ye

  const to = req.body.to;
  const amount = req.body.amount;

  const current_userId_accounInfo = await Account.findOne({
    userId: current_userId,
  }).session(session);

  if (!current_userId_accounInfo || current_userId_accounInfo.amount < amount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Insufficient balance",
    });
  }

  const toAccount = await Account.findOne({
    userId: to,
  }).session(session);

  if (!toAccount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Invalid account",
    });
  }

  await Account.updateOne(
    { userId: current_userId },
    { $inc: { balance: -amount } }
  ).session(session);
  await Account.updateOne(
    { userId: to },
    { $inc: { balance: amount } }
  ).session(session);

  // Commit the transaction
  await session.commitTransaction();

  res.json({
    message: "Transfer successful",
  });
});

module.exports = {
  accountRouter,
};
