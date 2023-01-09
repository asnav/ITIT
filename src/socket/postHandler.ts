
import { Server, Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import postController from "../controllers/post"

export = (io:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>, 
            socket:Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) => {
                
    const addNewPost = async (message) => {
        const res = await postController.addNewPostEvent({message: message, sender: socket.data.user}) //extract the user id from the socket 
        socket.emit('post:post', res)
    }

    const getAllPosts = async () => {
        console.log("getAllPosts handler")
        const res = await postController.getAllPostsEvent()
        socket.emit('post:get', res)
    }

    const getPostById = (payload) => {
        socket.emit('post:get:id', {status: 'Failed', data: "Not Implemented"})
    }

    const getPostBySender = (payload) => {
        socket.emit('post:get:sender', {status: 'Failed', data: "Not Implemented"})
    }

    const updatePost = (payload) => {
        socket.emit('post:put', {status: 'Failed', data: "Not Implemented"})
    }


    console.log('register echo handlers')
    socket.on("post:post", addNewPost)
    socket.on("post:get", getAllPosts)
    socket.on("post:get:id", getPostById)
    socket.on("post:get:sender", getPostBySender)
    socket.on("post:put", updatePost)
}
 