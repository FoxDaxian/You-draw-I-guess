const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const question = require('./question.js')
const config = require('./config.js')

// package.json中的script设置NODE_ENV=development，可是分辨当前运行环境，通过process.env.NODE_ENV获取
let conf = process.env.NODE_ENV === 'development' ? config.dev : config.prod

const forOut = {}
const users = []

const roundTime = conf.roundTime
let timer = null
let rounds = 0 // 总轮数 => 用户总数 * n
let curDraw = 0 // 当前作画的人
let tempQuestion = ''
let isPlaying = false

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
			state: !Object.keys(users).length,
			own: !Object.keys(users).length,
			index: users.length,
			score: 0
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
	socket.on('message', (msg, userInfo) => {
		if (isPlaying && tempQuestion.topic === msg) {
			users.some((el) => {
				if (el.id === userInfo.id) {
					el.score += 1
					return true
				}
			})
			io.to(clientUrlID).emit('anwser', userInfo, msg)
			tempQuestion = ''
			timer !== null && clearInterval(timer)
			timer = setInterval(roundContinue, roundTime)
			roundContinue()
		}
		socket.broadcast.emit('showMsg', msg, userInfo.name)
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
		if (isPlaying || !+index) {
			return
		}
		users[index].state = !users[index].state
		io.to(clientUrlID).emit('changeState', users)
	})

	// 开始游戏
	socket.on('startGame', () => {
		const canStart = users.every((el) => {
			return el.state
		})
		// 如果能开始游戏，则轮询当前用户们，依次画画
		if (canStart) {
			isPlaying = !isPlaying
			rounds = users.length

			io.to(clientUrlID).emit('start', curDraw, tempQuestion = randQuestion(), users[curDraw].name)
			curDraw++

			timer = setInterval(roundContinue, roundTime)
		} else {
			socket.emit('notPrepared')
		}
	})

	const roundContinue = () => {
		if (curDraw === rounds) {
			users.forEach((el, index) => {
				!index && (el.state = true)
				index && (el.state = false)
			})
			io.to(clientUrlID).emit('gameEnd', users)

			users.forEach((el, index) => {
				el.score = 0
			})

			timer !== null && clearInterval(timer)
			curDraw = 0
			isPlaying = !isPlaying
			return
		}

		io.to(clientUrlID).emit('changeDrawer', curDraw % users.length, tempQuestion = randQuestion(), users[curDraw % users.length].name)
		curDraw++

	}
})

http.listen(3000, () => {
	console.log('监听成功')
})