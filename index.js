// dotenv we use for hide the secret key 
require('dotenv').config()

const express=require('express');
const app=express()

const cors = require('cors')
const { userRouter } = require('./routes/user');
const { accountRouter } = require('./routes/account');

const FRONTEND_URL=require('./config')

const mongoose=require('mongoose')

const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:3000'
];

app.use(cors({
  origin:allowedOrigins,
  credentials:true
}))
// body barser 
app.use(express.json())


app.get('/',(req,res)=>{
   res.send('backend is running')
})
app.use('/api/v1/user',userRouter)
app.use('/api/v1/account',accountRouter)


async function main(){
  try {
    // mongodb url get from .env file using process.evn.nameofanymoudle inside the .env file 
    await mongoose.connect(process.env.MONGODB_URL+'payment')
    app.listen(3001);
    console.log('db connected port no is: ',3001)
  } catch (error) {
    console.log('db not connected and not port no work')
    console.log(error)
  }
}
main()

