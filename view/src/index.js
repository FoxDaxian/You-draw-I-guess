console.log('rollup压缩html') // TODO
import './style/reset.css'
import './style/index.scss'

import io from 'socket.io-client'

import Style from './js/style.js'
import Canvas from './js/canvas.js'

import Config from '../../config.js'

let conf
conf = ENV === 'development' ? Config.dev : Config.prod

window.addEventListener('load', (e) => {
	const username = 'fox'
	const socket = io(conf.ip)
	const canvas = document.querySelector('canvas')
	const input = document.querySelector('input')
	const form = document.querySelector('form')
	const view = document.querySelector('.view')
	const msgs = view.querySelector('.msgs')
	const user = view.querySelector('.user span')

	new Style(canvas, form, view)
	new Canvas(canvas, socket)

	// 连接
	socket.on('connect', () => {
		socket.emit('join', username)
	})

	socket.on('someoneJoin', (person, room, curUser) => {
		user.innerHTML = curUser
		console.log(`${ person } 加入了${ room }`)
	})

	// 断开
	socket.on('someoneLeave', (person, room, curUser) => {
		user.innerHTML = curUser
		console.log(`${ person } 离开了${ room }`)
	})

	// 显示聊天内容
	socket.on('showMsg', (msg, username) => {
		const msgEl = document.createElement('p')
		msgEl.innerHTML = `${ username }说: ${ msg }`
		msgs.appendChild(msgEl)
	})

	// 发送
	form.onsubmit = (e) => {
		const ev = e || window.event
		ev.preventDefault()
		socket.send(input.value, username)
		input.value = ''
	}
})
