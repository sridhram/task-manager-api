const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'task-manager';
const ObjectId = mongodb.ObjectId;
// id = new ObjectId();
// console.log(id);
mongoClient.connect(url,{useNewURLParser:true}, async (error,client) => {
    if(error){
        return console.log('unable to connect');
    }
    const db = client.db(dbName);
    // const resp = await db.collection('users').insertOne({
    //     _id:id,
    //     name:'kh',
    //     age:24,
    //     place:'Chennai'
    // });
    // console.log(resp);
    // const resp = await db.collection('tasks').insertMany([
    //     {name:'study',description:'to complete mongodb module by today',completed:false},
    //     {name:'workout',description:'weights and cardio',completed:false},
    //     {name:'Meditation',description:'meditate for 10 mins',completed:true}
    // ]);
    // console.log(resp);
    // const resp = await db.collection('users').find({age:24}).toArray((err, users) => {
    //     console.log(users);
    // });
    // console.log(resp);
//     const resp = db.collection('users').updateOne(
//         {name:'kh'},
//         {$set:
//             {name:'srkssrk'}
//         });
//     resp.then((res) => {console.log(res);});
// db.collection('tasks').updateMany(
//     {completed:false},
//     {$set:
//         {completed:true}
//     }).then((res) => {console.log(res);});
    db.collection('users').deleteMany({age:25}).then((res) => {console.log(res);});
});