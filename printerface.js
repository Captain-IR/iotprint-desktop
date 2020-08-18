const path = require('path')
const { spawn, exec, execSync } = require('child_process')
const io = require('./socket')

const options = {
	cwd: path.join(__dirname, 'printerface', 'pronsole'),
	end: null,
	detached: false,
}

let pronsole

exports.install = () => {
	pronsole = { installing: true }
	console.log('[+] Installing  Packages...')
	exec('pip install -r requirements.txt', options, (err, stderr, stdout) => {
		if (err) {
			console.error(err)
			process.exit()
		}
		console.log('[+] Installed Successfully')
		pronsole = { installing: false }
	})
}

exports.run = function () {
	if (!pronsole.installing) {
		pronsole = spawn('python', ['pronsole.py'], options)
		console.log('[+] Pronsole started')
	}
}

exports.commands = function (cmd) {
	try {
		if (!pronsole.installing) {
			console.log('[+] Command: ', cmd)
			pronsole.stdin.write(cmd + '\n')
		} else {
			console.log('[!] Pronsole not started!')
		}
	} catch (err) {
		console.log(err)
	}
}

exports.pronsole = function () {
	try {
		if (!pronsole.installing) {
			pronsole.stdout.on('data', data => {
				console.log(`stdout: ${data}`)
				io.getIO().emit('pronsole', { stdout: data.toString('utf8') })
			})

			pronsole.stderr.on('data', data => {
				console.error(`stderr: ${data}`)
				io.getIO().emit('pronsole', { stderr: data.toString('utf8') })
			})

			pronsole.on('close', code => {
				if (code !== 0) {
					console.log(`pronsole process exited with code ${code}`)
					pronsole.stdin.end()
				}
			})
		}
	} catch (err) {
		console.log(err)
	}
}

exports.rpc = function () {
	if (!pronsole.installing) {
		exec(
			'python rpc.py',
			{ cwd: path.join(__dirname, 'printerface') },
			(err, stderr, stdout) => {
				if (err) {
					console.log('[!] rpc failed to start')
					return
				}
				// console.log('stderr: ', stderr)
				// console.log('stdout: ', stdout)
				io.getIO().emit('rpcData', stderr)
			}
		)
	}
}
