const mongoose = require('mongoose');
module.exports= async()=>{
  const uri = "mongodb+srv://hammadmeer105:5vYA3S9k0uWY6zkH@cluster0.upy1ns4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    try {
      const connect = await mongoose.connect(uri, {
        useUnifiedTopology:true,
        useNewUrlParser:true,
        });
        console.log(`Connected to MongoDB Server`);
    } catch(error) {
      console.log(error);
      process.exit(1);
    }
};