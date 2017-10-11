const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const users = {}
let curUser = 0

io.on('connection', (socket) => {
	console.log(socket.id)
	// 小组名称 | ID
	const clientUrlID = socket.request.headers.referer

	// 加入
	socket.on('join', (data) => {
		users[socket.id] = data
		curUser += 1
		socket.join(clientUrlID)
		io.to(clientUrlID).emit('someoneJoin', users[socket.id] ,clientUrlID, curUser)
	})

	// 退出
	socket.on('disconnect', () => {
		const username = users[socket.id]
		users[socket.id] && delete users[socket.id]
		curUser -= 1
		socket.leave(clientUrlID)
		io.to(clientUrlID).emit('someoneLeave', username, clientUrlID, curUser)
	})


	// 发送
	socket.on('message', (msg, un) => {
		io.to(clientUrlID).emit('showMsg', msg, un)
	})

})

http.listen(3000, () => {
	console.log('监听成功')
})