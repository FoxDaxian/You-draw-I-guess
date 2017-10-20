const dev = {
	roundTime: 10000,
	ip: 'http://localhost:3000/',
	round: 1
}

const prod = {
	roundTime: 1000 * 60 * 3,
	ip: 'http://139.199.207.170:8080/',
	round: 3
}

module.exports = {
	dev, prod
}
