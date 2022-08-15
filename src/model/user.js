const mongoose = require('mongoose');
const  validator = require('validator');
const {Schema} = mongoose;
const bcrypt = require('bcrypt');
const task = require('./task.js')
const jwt = require('jsonwebtoken');


const UserSchema = new Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },
    age:{
        type:Number,
        validate(value){
            if(value<0 || value>110){
                throw new Error('age should be greater than 0 and less than 110');
            }
        },
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        validate:[
            {
                validator: (val) => {
                    if(!validator.isEmail(val)){
                        throw new Error('Email is not proper');
                    }
                }
            },
            {
                validator: async function(email) {
                    const user = await this.constructor.findOne({email});
                    if(user){
                        if(this.id === user.id){
                            return true;
                        }
                        throw new Error('user already registered');
                    }

                }
            }
        ]
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:6,
        validate(val){
            if(val.toLowerCase().includes('password')){
                throw new Error('password shouldnt contain the word "password"');
            }
        }
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    img:{
        type:Buffer
    }
}, {timestamps:true});

UserSchema.virtual('tasks',{
    ref:'tasks',
    localField:'_id',
    foreignField:'owner'
});

UserSchema.pre('save', async function(){
    const user = this;
    if(user.isModified('password')){
        console.log('hashing password');
        user.password = await bcrypt.hash(user.password,8);
    }
    console.log('done !!!!');
});

UserSchema.pre('remove', async function(){
    console.log('removing tasks')
    await task.deleteMany({owner:this._id});
    console.log('deleted all tasks for the user...');
});

UserSchema.statics.validateLogin = async (email, password) => {
    const user_res = await User.findOne({email});
    if(!user_res){
        throw new Error('unable to login');
    }
    if(!bcrypt.compare(user_res.password, password)){
        throw new Error('unable to login');
    }else{
        return user_res;
    }
}

UserSchema.methods.createToken = async function(){
    const token = await jwt.sign({id:this._id.toString()},'secretcode',{expiresIn:'1 day'});
    this.tokens = this.tokens.concat({token});
    await this.save();
    return token;
}

UserSchema.methods.toJSON = function(){
    const userObj = this.toObject();
    delete userObj.tokens;
    delete userObj.password;
    return userObj;
}

const User =  mongoose.model('User',UserSchema);
const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','');
        console.log(token);
        const decoded = jwt.verify(token, 'secretcode');
        console.log(decoded);
        const user = await User.findOne({_id:decoded.id,'tokens.token': token});
        if(!user){
            console.log('user not found');
            throw new Error();
        }
        req.user = user;
        req.token = token;
        console.log('user found');
        next();
    } catch(e){
        res.status(503).send('not authenticated');
    }
}

module.exports = {User, auth};