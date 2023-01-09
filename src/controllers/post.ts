
import Post from '../models/post_model'
import { Request,Response } from 'express'

const addNewPostEvent = async (newPost) => { 
    console.log("getting all posts for socketIO request")

    const post = new Post({
        message: newPost.message,
        sender: newPost.sender
    })

    try{
        const newPost = await post.save()
        console.log("save post in db")
        return {status: 'OK', data: newPost}
    }catch (err){
        console.log("fail to save post in db")
        return {status: 'FAIL', data: err.message}
    }

    try{
        const posts = await Post.find()
        return {status: 'OK', data: posts}
    }catch(err){
        return {status: 'FAIL', data: err.message}
    }
}

const getAllPostsEvent = async () => { 
    console.log("getting all posts for socketIO request")
    try{
        const posts = await Post.find()
        return {status: 'OK', data: posts}
    }catch(err){
        return {status: 'FAIL', data: err.message}
    }
}

const getPostByIdEvent = async (postId) => { 
    console.log("getting all posts for socketIO request")

    try{
        const post = await Post.findById(postId)
        return {status: 'OK', data: post}
    }catch(err){
        return {status: 'FAIL', data: err.message}
    }
}

const getAllPosts = async (req:Request ,res:Response)=>{
    try{
        let posts = {}
        if (req.query.sender == null){
            posts = await Post.find()
        }else{
            posts = await Post.find({'sender' : req.query.sender})
        }
        res.status(200).send(posts) 
    }catch(err){
        res.status(400).send({'error':"fail to get posts from db"})
    }
}

const getPostById = async (req:Request,res:Response)=>{
    console.log(req.params.id)

    try{
        const posts = await Post.findById(req.params.id)
        res.status(200).send(posts) 
    }catch(err){
        res.status(400).send({'error':"fail to get posts from db"})
    }
}


const addNewPost = async (req:Request,res:Response)=>{
    console.log(req.body)

    const post = new Post({
        message: req.body.message,
        sender: req.body.userId     //extract the user id from the auth 
    })

    try{
        const newPost = await post.save()
        console.log("save post in db")
        res.status(200).send(newPost)
    }catch (err){
        console.log("fail to save post in db")
        res.status(400).send({'error': 'fail adding new post to db'})
    }
}


const putPostById = async (req:Request,res:Response)=>{
    try{
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, {new: true})
        res.status(200).send(post)
    }catch (err){
        console.log("fail to update post in db")
        res.status(400).send({'error': 'fail adding new post to db'})
    }
}


export = {getAllPosts, addNewPost, getPostById, putPostById, getAllPostsEvent, getPostByIdEvent, addNewPostEvent}
