const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api');

// const ram_user = new User({
//     name:'Ram',
//     age:24,
//     email:'r@r.com',
//     password:'ram@123'
// });

// ram_user.save().then((resp) => {
//     console.log(resp);
//     console.log(ram_user);
// }).catch((err) => {console.log(err);});

// const task = mongoose.model('tasks',new Schema({
//     name:String,
//     description:String,
//     completed:{
//             type:Boolean,
//             default:false
//         }
// }));

// const node_task = new task({
//     name:'Node Course',
//     description:'Complete node js course by this weekend',
//     completed: false
// });
// node_task.save().then((resp) => {console.log(resp)}).catch( err => console.log(err) );