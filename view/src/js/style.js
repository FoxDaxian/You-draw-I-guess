class Style {
    constructor (canvas, view, curplayer) {
        console.log(curplayer)
        this.sizeObj = this.getSize()

        // canvas部分
        canvas.setAttribute('width', this.sizeObj.width * 0.6)
        canvas.setAttribute('height', this.sizeObj.height * 0.7)
        canvas.style.marginLeft = this.sizeObj.width * 0.01 + 'px'
        canvas.style.marginTop = this.sizeObj.height * 0.02 + 'px'

        // 展示信息部分
        view.style.width = this.sizeObj.width * 0.3 + 'px'
        view.style.height = this.sizeObj.height * 0.7 + 'px'
        view.style.marginTop = this.sizeObj.height * 0.02 + 'px'
        view.style.marginRight = this.sizeObj.width * 0.02 + 'px'

        // 当前用户部分
        curplayer.style.width = this.sizeObj.width + 'px'
        curplayer.style.height = this.sizeObj.height * 0.2 + 'px'
        curplayer.style.marginTop = this.sizeObj.height * 0.06 + 'px'
    }

    getSize () {
        let width, height

        // 获取窗口宽度
        if (window.innerWidth)
            width = window.innerWidth
        else if ((document.body) && (document.body.clientWidth))
            width = document.body.clientWidth

        if (window.innerHeight)
            height = window.innerHeight
        else if ((document.body) && (document.body.clientHeight))
            height = document.body.clientHeight

        // 通过深入 Document 内部对 body 进行检测，获取窗口大小
        if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
            width = document.documentElement.clientWidth
            height = document.documentElement.clientHeight
        }
        return {width, height}
    }
}

export default Style
