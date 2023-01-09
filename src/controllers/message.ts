// import Message from '../models/message_model'

// const getAllMessages = async (userId) => { 
//     console.log("getting all messages for a specified user")
    
//     try{
//       let messages = {}
//       if (userId == null){
//           messages = await Message.find({'sender' : req.query.sender})
//       }else{
//           posts = await Post.find({'sender' : req.query.sender})
//       }
//       res.status(200).send(posts) 
//   }catch(err){
//       res.status(400).send({'error':"fail to get posts from db"})
//   }

//         return {status: 'OK', data: posts}
//     }catch(err){
//         return {status: 'FAIL', data: ""}
//     }
// }