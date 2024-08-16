const {socket} = require('../../index')

socket.on('connection', (user) => {
    console.log('A user connected', user.id);
    testSocket()
//     user.on('/chat',(data)=>{
//         console.log("CHAT ON",data)
// })
})
const testSocket = (url,data) => {
    try  {
        socket.emit('/test',{message : "TestSocket"})
        console.log('socket send')
    }catch(error){
        console.log('Unable to emit socket')
    } 
}

const emitSocket = (url,data) => {
    try  {
        socket.emit(url,data ?? "")
        console.log('socket send')
    }catch(error){
        console.log('Unable to emit socket')
    } 
}



module.exports = {
    emitSocket
}