const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email:{
        type: String, 
        required: true,
        unique:true,
        lowercase:true,
    },
    password:{
        type: String, 
        required: true,
        select:false,
    },
    name:{
        type:String,
        required:true
    },
    bio:{
        type:String,
    },
    avatar:{
        publicId:String,
        url:String,
    },
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref :'user'
        }
    ],
    followings:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref :'user'
        }
    ],
    posts:[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ]
},{
    timestamps:true,
})

// table is created in atlas with the name of user  and the schema followed in db is userSchema we created before
module.exports = mongoose.model('user',userSchema);