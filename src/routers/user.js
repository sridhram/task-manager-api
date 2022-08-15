const express = require('express');
const userRouter = new express.Router();
const multer = require('multer');
const sharp = require('sharp');
const {'User':UserSchema, auth} = require('../model/user.js');

userRouter.post('/users', async (req, res) => {
    const user_ram = new UserSchema(req.body);
    const token = await user_ram.createToken();
    try{
        await user_ram.save();
        res.status(201).send({user_ram, token});
    }catch(err){
        res.status(400).send(err.message);
    }
});

userRouter.post('/login', async (req, res) => {
    try{
        const user_res = await UserSchema.validateLogin(req.body.email, req.body.password);
        const token = await user_res.createToken();
        res.status(200).send({user_res, token});
    }catch(err){
        res.status(400).send(err);
    }
});

const upload = multer({
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('must be a jpg, jpeg or png file'));
        }
        cb(undefined, true);
    },
    limits:{
        fileSize:2000000
    }
})
userRouter.post('/users/upload', auth, upload.single('upload'), async (req, res) => {
    req.user.img = await sharp(req.file.buffer).png().resize({width:250,height:250}).toBuffer();
    await req.user.save();
    res.status(201).send();
},(err, req, res, next) => {
    res.status(400).send(err.message);
});

userRouter.post('/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.status(200).send('logged out successfully');
    }catch(err){
        res.status(500).send('auth failed');
    }
});

userRouter.post('/logoutall', auth, async (req, res) => {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send('logged out of all sessions');
    }catch(err){
        res.status(500).send('auth failed');
    }
});

userRouter.get('/users/me', auth, async (req, res) => {
    try{
        res.send(req.user);
    }catch(err){
        res.status(404).send('Please try after sometime');
    }
});

userRouter.get('/users/profile', auth, async (req, res) => {
    if(req.user.img){
        res.set('Content-Type','image/png');
        res.status(200).send(req.user.img);
    }else{
        res.status(400).send('no profile pic');
    }
});

userRouter.patch('/users/me', auth, async (req, res) => {
    try{
        const keys = Object.keys(req.body);
        const operations = ['name', 'age', 'email', 'password'];
        if(!keys.every(key => operations.includes(key))){
            return res.status(404).send('invalid operation');
        }
        const user = req.user;
        operations.forEach((param) => {
            if(req.body[param])
                user[param] = req.body[param];
        });
        await user.save();
        res.status(200).send(user);
    }catch(err){
        res.status(500).send(err.message);
    }
});

userRouter.delete('/users/me', auth, async (req, res) => {
    try{
        const user = req.user;
        await req.user.remove();
        if (!user){
            res.status(404).send('user not found');
        }else{
            res.status(200).send(user);
        }
    }catch(err){
        res.status(500).send(err.message);
    }
});

userRouter.delete('/users/profile/delete', auth, async (req, res,) => {
    try{
        const user = req.user;
        user.img = undefined;
        await user.save();
        res.status(200).send('successfully removed the profile pic');
    }catch(err){
        res.status(500).send(err.message);
    }
});



module.exports = userRouter;