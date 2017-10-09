const express = require('express')
const app = express()

app.get('/', (req, res) => {
	res.send('你好12')
})

app.listen(3000, () => {
	console.log('监听成功')
})