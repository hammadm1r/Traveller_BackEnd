const jwt = require("jsonwebtoken");
const { error } = require("../utils/responseWrapper");
const User = require("../models/User");

module.exports = async (req, res, next) => {
    if (
      !req.headers ||
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
       // return res.status(401).send('Authorization Header is Required');
        return res.send(error(401,'Authorization Header is Required'));
    }
    const accessToken = req.headers.authorization.split(" ")[1];
    try {
        const decoded = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_PRIVATE_KEY
        );
        req._id = decoded._id;
        
        const user = await User.findById(req._id);
        if (!user){
          return res.send(error(404,'User Not Found'));
        }
        next();
      } catch (e) {
        //return res.status(401).send({ error: "Invalid Token" });
        return res.send(error(401,'Invalid Access Token'));
      }
};