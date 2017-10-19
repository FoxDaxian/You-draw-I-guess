import tool from './tools.js'

class Canvas {
	constructor (canvas, socket) {
		// socket 相关
		this.canStart = false
		this.canDraw = true

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
			if (this.canStart && this.canDraw) {
				return
			}
			if (this.flag) {
				const ev = e || window.event
				this.ctx.lineTo(ev.offsetX, ev.offsetY)
				this.ctx.stroke()
				// socket
				!this.canStart || this.socket.emit('move', {x: ev.offsetX, y: ev.offsetY, w: this.w, h: this.h})
			}
		}

		canvas.addEventListener('mousedown', (e) => {
			if (this.canStart && this.canDraw) {
				return
			}

			if (!this.flag) {
				const ev = e || window.event
				this.flag = !this.flag
				// 需要beginPath来重新开始路径，这样就可以清除画布了
				this.ctx.beginPath()
				this.ctx.moveTo(ev.offsetX, ev.offsetY)
				// socket
				!this.canStart || this.socket.emit('click', {x: ev.offsetX, y: ev.offsetY, w: this.w, h: this.h})
			}
		})

		
		window.addEventListener('mousemove', tool.debounce(moveFn, 15, this))

		window.addEventListener('mouseup', (e) => {
			if (this.flag) {
				this.flag = !this.flag
				this.ctx.closePath()
			}
		})
	}

	clearCanvas () {
		this.ctx.clearRect(0, 0, this.w, this.h)
		this.ctx.beginPath()
	}

	// socket
	socketClick ({x, y, w, h}) {
		this.ctx.beginPath()
		this.ctx.moveTo(x / w * this.w, y / h * this.h)
	}
	socketMove ({x, y, w, h}) {
		this.ctx.lineTo(x / w * this.w, y / h * this.h)
		this.ctx.stroke()
	}
}

export default Canvas
