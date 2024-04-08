// import express from 'express';
// import jwt from 'jsonwebtoken';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import shortid from 'shortid';
// import sanitizeHtml from 'sanitize-html';
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const shortid = require('shortid');
const sanitizeHtml = require('sanitize-html');
const app = express();

app.use(express.json);
app.use(cors);

const SECRET = 'secret';

const newsSchema = new mongoose.Schema({
    story : String,
    comments : String,
    likes : Number,
    published : Boolean,
    date : Date
});

const userSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
    comments : String,
    date : Date,
    id : String,
    karmap : Number,
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'News'
    }]
});

const User = mongoose.model('User', userSchema);
const News = mongoose.model('News', newsSchema);


const authenticateJwt = (req, res, next) =>{
    const authHeader = req.headers.authorization;
    if(authHeader){
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET, (err, user) => {
            if(err){
                res.send(403);
            }else{
                req.user = user;
                next();
            }
        });
    }else{
        res.send(401);
    }
};

//high-level routes : /users/, /news/, /news:id/comments, /news:id/like
//user routes: /users/user:id, /users/user:id/submissions, /users/user:id/creation-date, /users/user:id/comments, /users/user:id/karma-points, user/signup, user/sigin
//news schema : {story, comments, likes}
//user schema : {name, email, password, id}
//classfication of stories : top-more comments, new- date-wise, best-more likes

mongoose.connect('mongodb+srv://mantissa6789:Mantis%401647@cluster0.9ramotn.mongodb.net/News_application', {dbName: "News_application"});

app.post('/user/signup', validateUserInput, async (req, res) => {
    const { username, email, password } = req.body;
    function callBack(user) {
        if (user) {
            res.status(403).json({ message: 'User already exists' });
        } else {
            const date = new Date();
            const id = shortid.generate();
            const sanitizedUsername = sanitizeHtml(username, {
                allowedTags: [],
                allowedAttributes: {}
            });
            const obj = { username: sanitizedUsername, email, password, date, id };
            const newUser = new User(obj);
            newUser.save()
                .then(() => {
                    const token = jwt.sign({ username: sanitizedUsername }, SECRET, { expiresIn: '1h' });
                    res.json({ message: "User created successfully", token: token });
                })
                .catch((err) => handleDatabaseError(err, res));
        }
    }
    User.findOne({ username }).then(callBack);
});

app.post('/user/sigin', async (req, res) => {
    const { username, email, password } = req.body;
    const sanitizedUsername = sanitizeHtml(username, {
        allowedTags: [],
        allowedAttributes: {}
    });
    const user = await User.findOne({ username: sanitizedUsername, email, password });
    if (user) {
        const token = jwt.sign({ username: sanitizedUsername }, SECRET, { expiresIn: '1hr' });
        res.json({ message: "User logged in successfully", token: token });
    } else {
        res.status(403).json("Invalid username or password");
    }
});

const validateUserInput = (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
    }
    if (username.length < 3 || password.length < 6) {
        res.status(400).json({ message: 'Invalid username or password' });
        return;
    }
    next();
};

const handleDatabaseError = (err, res) => {
    if (err.message === 'User already exists') {
        res.status(403).json({ message: 'User already exists' });
        return;
    }
    res.status(500).json({ message: 'Internal server error' });
};

app.post('/user/submission', authenticateJwt, async (req, res) => {
    const { story } = req.body;
    const id = shortid.generate();
    const date = new Date();
    const sanitizedStory = sanitizeHtml(story, {
      allowedTags: [],
      allowedAttributes: {}
    });
    const obj = { story: sanitizedStory, id: id, published: true, like: 0, date: date };
    const news = new News(obj);
    await news.save();
    res.json("News is created successfully");
  });

app.get('/users/:user_id', async (req, res) => {
    const {user_id} = req.params.user_id;
    const user = await User.findById(user_id);
    if(user){
        res.json(user).status(200);
    }else{
        res.json({message : "wrong user id"}).status(403);
    }
});

app.get('user/:user_id/creationDate', async (req, res) => {
    const {user_id} = req.params.user_id;
    const user = await User.findById(user_id);
    if(user){
        const date = user.date;
        res.json({message : "The creation date is: " + date}).status(200);
    }else{
        res.json({message : "wrong user id"}).status(403);
    }
});

app.get('user/:user_id/submissions', async (req, res) => {
    const {user_id} = req.params.user_id;
    const user = await User.findById(user_id);
    if(user){
        // const array = [];
        const submissions = user.submissions;
        res.json({message : "these are the submissions", data: submissions}).status(200);
    }else{
        res.json({message : "provide correct user id"}).status(402);
    }
});

app.get('user/:user_id/comments', async (req, res) => {
    const {user_id} = req.params.user_id;
    const user = await User.findById(user_id);
    if(user){
        // const array = [];
        const comments = user.comments;
        res.json({message : "these are the commnets you ave made", data: comments}).status(200);
    }else{
        res.json({message : "provide correct user id"}).status(402);
    }
});

app.get('user/:user_id/karma_points', async (req, res) => {
    const {user_id} = req.params.user_id;
    const user = await User.findById(user_id);
    if(user){
        // const array = [];
        const karmap = user.karmap;
        res.json({message : "you are karma ponts are", data: karmap}).status(200);
    }else{
        res.json({message : "provide correct user id"}).status(402);
    }
});

app.post('/user/:news_id/comments', authenticateJwt, async (req, res) => {
    const { news_id } = req.params;
    const { comments } = req.body;
    const news = await News.findById(news_id);
    const sanitizedComments = sanitizeHtml(comments, {
      allowedTags: [],
      allowedAttributes: {}
    });
    news.comments = sanitizedComments;
    news.save();
    res.json("Comment added successfully");
  });

app.post('/user/:news_id/like', authenticateJwt, async (req,res) => {
    const {news_id} = req.params.news_id;
    const news = await News.findById(news_id);
    news.like += 1;
    news.save();
});

app.get('/news', authenticateJwt, async (req, res) => {
    const news = await News.find({published : true});
    res.json(news);
});

app.get('/news/:news_id/comments', authenticateJwt, async (req,res) => {
    const {news_id} = req.params.news_id;
    const news = await News.findById(news_is);
    res.json({message : "these are the comments for this news", data: news.comments}).status(200);
});

app.get('/news/top', authenticateJwt, async (req, res) => {
    const topStories = await News.find({ published: true }).sort({ commentsCount: -1 }).limit(10);
    res.json(topStories);
});

app.get('/news/new', authenticateJwt, async (req, res) => {
    const newStories = await News.find({ published: true }).sort({ date: -1 }).limit(10);
    res.json(newStories);
});

app.get('/news/best', authenticateJwt, async (req, res) => {
    const bestStories = await News.find({ published: true }).sort({ likesCount: -1 }).limit(10);
    res.json(bestStories);
});

app.post('/user/bookmark/news/:news_id', authenticateJwt, async (req, res) => {
    const { news_id } = req.params;
    const user = await User.findById(req.user.id);
    if (!user.bookmarks.includes(news_id)) {
        user.bookmarks.push(news_id);
        await user.save();
        res.json({ message: 'News bookmarked successfully' });
    } else {
        res.status(400).json({ message: 'News already bookmarked' });
    }
});

app.get('/user/bookmarks', authenticateJwt, async (req, res) => {
    const user = await User.findById(req.user.id).populate('bookmarks');
    res.json(user.bookmarks);
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});