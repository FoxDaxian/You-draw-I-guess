import tool from './tools.js'

class Canvas {
	constructor (canvas, socket) {
		this.flag = false
		this.socket = socket

		this.canvas = canvas
		this.w = canvas.width
		this.h = canvas.height
		this.ctx = canvas.getContext('2d')
		this.ctx.strokeStyle = "rgb(250,0,0)"

		this.operate(canvas)
	}

	operate (canvas) {

		const moveFn = (e) => {
			if (this.flag) {
				const ev = e || window.event
				this.ctx.lineTo(ev.offsetX, ev.offsetY)
				this.ctx.stroke()
				// socket
				this.socket.emit('move', {x: ev.offsetX, y: ev.offsetY, w: this.w, h: this.h})
			}
		}

		canvas.addEventListener('mousedown', (e) => {
			if (!this.flag) {
				const ev = e || window.event
				this.flag = !this.flag
				this.ctx.moveTo(ev.offsetX, ev.offsetY)
				// socket
				this.socket.emit('click', {x: ev.offsetX, y: ev.offsetY, w: this.w, h: this.h})
			}
		})

		
		window.addEventListener('mousemove', tool.debounce(moveFn, 15, this))

		window.addEventListener('mouseup', (e) => {
			if (this.flag) {
				this.flag = !this.flag
			}
		})
	}

	// 这里同步操作
	socketClick ({x, y, w, h}) {
		this.ctx.moveTo(x / w * this.w, y / h * this.h)
	}
	socketMove ({x, y, w, h}) {
		this.ctx.lineTo(x / w * this.w, y / h * this.h)
		this.ctx.stroke()
	}
}

export default Canvas
