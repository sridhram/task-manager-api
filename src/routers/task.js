const express = require('express');
const taskRouter = new express.Router();
const taskSchema = require('../model/task.js');
const {auth} = require('../model/user.js');

taskRouter.post('/tasks', auth, async (req, res) => {
    const task = {
        ...req.body,
        'owner': req.user._id
    }
    const node_task = new taskSchema(task);
    try{
        await node_task.save();
        res.status(201).send(node_task);
    }catch(err){
        res.status(400).send(err.message);
    }
});

taskRouter.get('/tasks', auth, async (req, res) => {
    try{
        const match = {};
        if(req.query.completed){
            match.completed = req.query.completed == 'true';
        }
        const sort = {};
        if(req.query.sortBy){
            const columns = req.query.sortBy.split('_');
            sort[columns[0]] = columns[1] == 'asc' ? 1 : -1;
        }
        console.log(sort)
        await req.user.populate({
            path:'tasks', 
            match, 
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            },
        });
        res.send(req.user.tasks);
    }catch(err){
        res.status(404).send(err);
    }
});

taskRouter.get('/tasks/:id', auth, async (req, res) => {
    try{
        const task = await taskSchema.findOne({'_id':req.params.id, 'owner':req.user._id});
        if(!task){
            res.status(404).send('task not found');
        }
        res.send(task);
    }catch(err){
        res.status(500).send(err.message);
    }
});

taskRouter.patch('/tasks/:id', auth, async (req, res) => {
    try{
        const task = await taskSchema.findOne({_id:req.params.id, owner:req.user._id});
        const keys = Object.keys(req.body);
        console.log(task.name);
        const operations = ['name', 'description', 'completed'];
        if (!task){
            res.status(404).send('task not found');
        }
        if(!keys.every(key => operations.includes(key))){
            return res.status(404).send('invalid operation');
        }
        else{
            operations.forEach((operation) => {
                if(req.body[operation])
                    task[operation] = req.body[operation];
            });
            await task.save();
            res.status(200).send(task);
        }
    }catch(err){
        res.status(500).send(err.message);
    }
});

taskRouter.delete('/tasks/:id', auth, async (req, res) => {
    try{
        const task = await taskSchema.findOneAndDelete({_id: req.params.id, owner:req.user._id});
        if (!task){
            res.status(404).send('task not found');
        }else{
            res.status(200).send(task);
        }
    }catch(err){
        res.status(500).send(err.message);
    }
});


module.exports = taskRouter;