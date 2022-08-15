const mongoose = require('mongoose');
const  validator = require('validator');
const {Schema} = mongoose;

const task = mongoose.model('tasks',new Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type: String,
    },
    completed:{
            type:Boolean,
            default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
}, {timestamps:true, toJson: { virtuals: true },
toObject: { virtuals: true }}));

module.exports = task;