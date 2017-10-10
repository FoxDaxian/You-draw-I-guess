console.log('rollup压缩html') // TODO
import './style/reset.css'
import './style/index.scss'

import io from 'socket.io-client'

import Style from './js/style.js'


window.addEventListener('load', (e) => {

	const socket = io('http://localhost:3000/')
	const canvas = document.querySelector('canvas')
	const input = document.querySelector('input')
	const form = document.querySelector('form')
	const view = document.querySelector('.view')
	const msgs = view.querySelector('.msgs')

	new Style(canvas, form, view)

	socket.on('showMsg', (msg) => {
		const msgEl = document.createElement('p')
		msgEl.innerHTML = `${ username }说: ${ msg }`
		msgs.appendChild(msgEl)
	})
	form.onsubmit = (e) => {
		const ev = e || window.event
		ev.preventDefault()
		socket.emit('sendMsg', input.value)
		input.value = ''
	}
})
	