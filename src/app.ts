import server from './server'
import io from './socket_server'

server.listen(process.env.PORT,()=>{
    io(server)
    console.log('Server started')    
})

export = server

