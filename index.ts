import Server from './src/modules/server'

process.title = 'AutoMUKit API'
const server = new Server()
server.start()
