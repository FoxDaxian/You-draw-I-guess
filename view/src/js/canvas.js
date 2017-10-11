class Canvas {
	constructor (canvas, socket) {
		this.flag = false
		this.socket = socket

		this.ctx = canvas.getContext('2d')
		this.ctx.strokeStyle = "rgb(250,0,0)"


		this.operate(canvas)
	}

	operate (canvas) {

		canvas.addEventListener('mousedown', (e) => {
			if (!this.flag) {
				const ev = e || window.event
				this.flag = !this.flag
				this.ctx.moveTo(ev.pageX - 12, ev.pageY - 18)
				// 这里开始写
				// this.socket.emit('click', {x: ev.pageX, y: ev.pageY})
			}
		})

		window.addEventListener('mousemove', (e) => {
			if (this.flag) {
				const ev = e || window.event
				this.ctx.lineTo(ev.pageX - 12, ev.pageY - 18)
				this.ctx.stroke()
			}
		})

		window.addEventListener('mouseup', (e) => {
			if (this.flag) {
				this.flag = !this.flag
			}
		})
	}

	// 这里同步操作
	socketClick ({startX, startY}) {
		canvas.addEventListener('mousedown', (e) => {
			if (!this.flag) {
				const ev = e || window.event
				this.flag = !this.flag
				this.ctx.moveTo(ev.pageX - 12, ev.pageY - 18)
			}
		})
	}
	socketMove ({moveX, moveY}) {
		window.addEventListener('mousemove', (e) => {
			if (this.flag) {
				const ev = e || window.event
				this.ctx.lineTo(ev.pageX - 12, ev.pageY - 18)
				this.ctx.stroke()
			}
		})

		window.addEventListener('mouseup', (e) => {
			if (this.flag) {
				this.flag = !this.flag
			}
		})

	}
}

export default Canvas
