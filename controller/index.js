const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const axios = require('axios')

const printerface = require('../printerface')

// axios.defaults.baseURL = 'http://localhost:5000/api'

exports.index = (req, res, next) => {
	setTimeout(() => {
		printerface.pronsole()
	}, 2000)

	res.render('index', { title: 'Dashboard' })
}

exports.postAuto = async (req, res, next) => {
	const productId = req.body.productId
	console.log('productId: ', productId)

	try {
		const product = await axios.get(`/download/${productId}`)
		const stlData = product.data
		const filename = `${crypto.randomBytes(8).toString('hex')}`

		fs.writeFile(
			path.join(__dirname, '..', 'downloads/', filename + '.stl'),
			stlData,
			err => {
				if (err) throw err
				console.log('[+] STL File has beed saved')
				printerface.slice(filename)
				printerface.commands(`load ../../downloads/${filename}.gcode`)
				printerface.commands(`print`)
			}
		)
		res.status(200).json({ msg: 'Start OK' })
	} catch (err) {
		console.log(err)
		next(err)
	}
}
