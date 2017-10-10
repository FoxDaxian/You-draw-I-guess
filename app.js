const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.get('/', (req, res) => {
	res.send('你好12')
})

io.on('connection', (socket) => {
	socket.on('disconnect', () => {
		console.log('用户退出')
	})
	socket.on('sendMsg', (msg) => {
		io.emit('showMsg', msg)
	})

})

http.listen(3000, () => {
	console.log('监听成功')
})