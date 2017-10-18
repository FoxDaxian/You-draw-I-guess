const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const question = require('./question.js')

const forOut = {}
const users = []

const roundTime = 60000
let timer = null
let rounds = 0 // 总轮数 => 用户总数 * n
let curDraw = 0 // 当前作画的人
let tempQuestion = ''

const randQuestion = () => {
	const len = question.length
	return question.splice(~~(Math.random() * len), 1)[0]
}

io.on('connection', (socket) => {
	// 小组名称 | ID
	const clientUrlID = socket.request.headers.referer

	socket.on('setId', (name) => {
		const temp = {
			id: socket.id,
			name: name,
			state: false,
			own: !Object.keys(users).length,
			index: users.length
		}
		forOut[socket.id] = temp
		users.push(temp)
		socket.join(clientUrlID)

		// 给当前的客户端发送事件
		socket.emit('updateUserInfo', users[temp.index])
	})

	// 加入
	socket.on('join', (username) => {
		io.to(clientUrlID).emit('someoneJoin', users, username, clientUrlID)
	})

	// 退出
	socket.on('disconnect', () => {
		timer !== null && clearInterval(timer)
		curDraw = 0

		// 删除退出的用户
		const activeUser = users.splice(forOut[socket.id].index, 1)[0]

		// 设置第一个用户为新的房主
		users.forEach((el, index) => {
			!index && (el.own = true)
			!index && (el.state = true)
			// 引用类型，所以重置了index，便可以正确的splice
			el.index = index
		})

		socket.leave(clientUrlID)
		socket.broadcast.emit('someoneLeave', activeUser.name, users, clientUrlID)
	})


	// 发送
	socket.on('message', (msg, un) => {
		if (tempQuestion.topic === msg) {
			io.to(clientUrlID).emit('anwser', un)
		}
		console.log(tempQuestion)
		socket.broadcast.emit('showMsg', msg, un)
	})

	// canvas
	socket.on('click', (data) => {
		socket.broadcast.emit('updateClick', data)
	})

	socket.on('move', (data) => {
		socket.broadcast.emit('updateMove', data)
	})

	// 切换用户准备状态
	socket.on('toggleState', (index) => {
		users[index].state = !users[index].state
		io.to(clientUrlID).emit('changeState', users)
	})

	// 开始游戏
	socket.on('startGame', () => {
		console.log()
		const canStart = users.every((el) => {
			return el.state
		})
		// 如果能开始游戏，则轮询当前用户们，依次画画
		if (canStart) {
			rounds = users.length

			io.to(clientUrlID).emit('start', curDraw, tempQuestion = randQuestion())
			curDraw++

			timer = setInterval(() => {
				if (curDraw === rounds) {
					timer !== null && clearInterval(timer)
					curDraw = 0
					io.to(clientUrlID).emit('gameEnd')
					return
				}

				io.to(clientUrlID).emit('changeDrawer', curDraw % users.length, tempQuestion = randQuestion())
				curDraw++

			}, roundTime)
		} else {
			socket.emit('notPrepared')
		}
	})
})

http.listen(3000, () => {
	console.log('监听成功')
})