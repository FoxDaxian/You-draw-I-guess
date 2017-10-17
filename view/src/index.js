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
	const curplayer = document.querySelector('.curplayer')

	const submitComments = (msg, username) => {
		const msgEl = document.createElement('p')
		msgEl.innerHTML = `${ username }说: ${ msg }`
		msgs.appendChild(msgEl)
	}

	const userTips = (person, operate, room) => {
		const msgEl = document.createElement('p')
		msgEl.innerHTML = `${ person } ${ operate } ${ room }`
		msgs.appendChild(msgEl)
	}

	const renderUser = (person, index) => {
		const html = `
		<div class="player">
			<p class="title">玩家${ index }</p>
			<p class="state">未准备</p>
			<p class="nick">${ person }</p>
		</div>
		`
		const temp = document.createElement('div')
		temp.innerHTML = html
		curplayer.appendChild(temp.children[0])
	}


	new Style(canvas, view, curplayer)
	const instance = new Canvas(canvas, socket)

	socket.on('updateClick', (data) => {
		instance.socketClick(data)
	})
	socket.on('updateMove', (data) => {
		instance.socketMove(data)
	})

	// 连接
	socket.on('connect', () => {
		socket.emit('join', username)
	})

	// 用户加入
	socket.on('someoneJoin', (person, room, curUser) => {
		curplayer.innerHTML = ''
		user.innerHTML = curUser

		for (let i = 0; i < curUser; i++) {
			renderUser(person, i + 1)
		}
		userTips(person, '加入了', room)
	})

	// 用户离开
	socket.on('someoneLeave', (person, room, curUser) => {
		user.innerHTML = curUser
		userTips(person, '离开了', room)
	})

	// 显示聊天内容
	socket.on('showMsg', submitComments)

	// 发送
	form.onsubmit = (e) => {
		const ev = e || window.event
		ev.preventDefault()
		submitComments(input.value, username)
		socket.send(input.value, username)
		input.value = ''
	}
})
