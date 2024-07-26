const express = require('express');
const dotenv = require('dotenv');
const dbconnect = require('./dbConnect');
const authController = require('./routers/authRouter');
const postsRouter = require('./routers/postsRouter');
const userRouter = require('./routers/userRouter')
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary').v2;

// configuration  Cloudinary  
          
cloudinary.config({ 
  cloud_name: 'dbl1xvrat', 
  api_key: '123923687469662', 
  api_secret: 'm-__rt1k62zU5r3pjzCuhKSmuAs' 
});
//cloudinary.config({ 
 // cloud_name: process.env.CLOUD_NAME, 
 // api_key: process.env.API_KEY, 
 // api_secret: process.env.API_SECRET,
//});

// Middlewares
const app = express();

app.use(express.json({limit:'10mb'}));
app.use(morgan('common'));
app.use(cookieParser());
app.use(cors({ 
    credentials: true,
    origin:'http://localhost:3000',
 }));
app.use('/auth', authController);
app.use("/posts", postsRouter)
app.use("/user", userRouter)
app.get('/',(req,res)=>{
    res.status(200).send('Ok From Server');
})

dotenv.config('./.env');
const PORT = process.env.PORT || 5000;
dbconnect();
app.listen(PORT , ()=>{
    console.log(`listening on port : ${PORT}`);
})