const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error } = require("../utils/responseWrapper");
const { success } = require("../utils/responseWrapper");

const signupController = async(req,res) => {
    try{
        const { email, password , name} = req.body;
        if (!email || !password || !name) {
            //return res.status(400).send('All fields are required');
            return res.send(error(400,'All fields are Required'));
        }

        //Checking if the user already exists
        let olduser = await User.findOne({ email });

        if (olduser) {
            //return res.status(409).send('User is Already Registered');
            return res.send(error(409,'User is Already Registered'));
          }

          //to convert password to hash
        const hashedPassword = await bcrypt.hash(password, 10);
        //to save user in the database
        const user = await User.create({
        name,
        email,
        password: hashedPassword,
        });

        const newUser= await User.findById(user._id);
    //return res.status(201).json({
    //  user,
    //});
    return res.send(success(201,"User Created Successfully"));

    }catch(e){
        return res.send(error(500,e.message));
    }
}

const loginController = async(req,res) => {
    try{
        const { email, password } = req.body;
        if (!email || !password) {
            //return res.status(400).send('All fields are required');
            return res.send(error(400,'All fields are Required'));
        }

        //Checking user 
        let user = await User.findOne({ email }).select('+password');

        if (!user) {
            //return res.status(404).send('User is not registered');
            return res.send(error(404,'User is not registered'));
          }

        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            return res.send(error(403,'Incorrect Password'));
        }

        const accessToken = generateAccessToken({ _id: user._id, });
        const refreshToken = generateRefreshToken({ _id: user._id, });
        res.cookie('jwt',refreshToken , {httpOnly : true, secure:true})
        return res.send(success(200, {accessToken}));
        
    }catch(e){
      return res.send(error(500,e.message));
  }
};

const logoutController = async(req,res) =>{
  try {
     res.clearCookie("jwt", {httpOnly : true, secure:true})
     return res.send(success(200,'User Logged Out'));
  } catch (e) {
    return res.send(error(500,e.message));
  }
  
}

// Internal Function 

const generateAccessToken = (data) => {
    try {
      const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
        expiresIn: "1d",
      }); //secret key for generating token
      console.log(token);
      return token;
    } catch (error) {
      console.log(error);
    }
  };

  const generateRefreshToken = (data) => {
    try {
      const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
        expiresIn: "1y",
      }); //secret key for generating token
      console.log(token);
      return token;
    } catch (error) {
      console.log(error);
    }
  };
//this Api will Check refreshToken Validity and Generate a New accessToken
  const refreshAccessTokenController = async(req,res) =>{
    const cookies= req.cookies;
    if (!cookies.jwt ) {
      //return res.status(401).send("Refresh Token in Cookies Is Required");
      return res.send(error(401,'Refresh Token in Cookies Is Required'));
    }
    const refreshToken = cookies.jwt
    console.log('refreshToken',refreshToken);
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_PRIVATE_KEY
      );
      const _id = decoded._id;
      const accessToken = generateAccessToken({ _id })
      return res.send(success(201,{ accessToken }));
    } catch (err) {
      //return res.status(401).send("Invalid Refresh Token" );
      return res.send(error(401,'Invalid Refresh Token'));
    }
  }

module.exports={
    signupController,
    loginController,
    refreshAccessTokenController,
    logoutController
}