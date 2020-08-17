const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const indexRouter = require('./routes/index')

const printerface = require('./printerface')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})

printerface.install()

let rpcInterval

const server = app.listen(3000)
const io = require('./socket').init(server)
io.on('connection', client => {
	console.log('[+] Client connected')
	printerface.run()

	client.on('rpcOn', data => {
		console.log('rpcOn: ', data)
		if (data.rpc === 'ON') {
			rpcInterval = setInterval(() => {
				printerface.rpc()
			}, 5000)
		}
	})

	client.on('rpcOff', data => {
		console.log('rpcOff: ', data)
		if (data.rpc === 'OFF') {
			clearInterval(rpcInterval)
		}
	})

	client.on('command', cmd => {
		console.log(cmd)
		printerface.commands(cmd)
	})

	client.on('disconnect', data => {
		console.log('[!] Client disconnected')
		clearInterval(rpcInterval)
		printerface.commands('exit')
	})
})
