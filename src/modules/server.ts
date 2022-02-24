import 'dotenv/config'
import express from 'express'
import * as http from 'http'
import MUKit from './mukit'
import { Input } from '../types'
import Validator from './validator'

export default class Server {
  static instance?: Server
  private server?: http.Server
  private debug = false

  constructor() {
    if (Server.instance) {
      return Server.instance
    }
    Server.instance = this
    this.debug = process.env.DEBUG === 'true'
  }

  start(): http.Server {
    const date = new Date()
    console.log(`${date.toJSON()} - Starting AutoMUKit API server...`)
    this.debugLog('Debug mode is on')
    const app = express()
    app.use(express.json())
    app.set('view engine', 'pug')
    app.get('/', function (req, res) {
      console.log(`${date.toJSON()} - Processing GET request from ${req.headers.referer}`)
      res.render('index', { baseUrl: process.env.BASE_URL })
    })
    app.use(express.static('public'))
    app.post('/', this.handlePost.bind(this))
    const port = process.env.SERVER_PORT
    this.server = app.listen(port, () => {
      console.log(`Listening on port ${port}`)
    })
    return this.server
  }

  stop(): void {
    this.server?.close()
  }

  private handlePost(req: express.Request, res: express.Response): void {
    const date = new Date()
    console.log(`${date.toJSON()} - Processing POST request from ${req.headers.referer}`)
    const contentType = req.get('Content-type')
    this.debugLog(`Handling POST request body: ${JSON.stringify(req.body, null, 2)}`)
    if (!contentType || contentType.indexOf('application/json') === -1) {
      this.debugLog(`Invalid content type: ${contentType}. Responding with 415.`)
      res.sendStatus(415)
      return
    }
    const errors = Validator.validateInputFormat(req.body)
    if (errors.length > 0) {
      this.debugLog(`Input format validation failed: ${JSON.stringify(errors)}. Responding with 400.`)
      res.status(400).send({ errors })
      return
    }
    const results = []
    try {
      const input = req.body as Input
      const precision = process.env.PRECISION !== undefined ? parseInt(process.env.PRECISION, 10) : 0
      const mukit = new MUKit(input, process.env.NODE_ENV === 'test' ? 2 : precision)
      for (const range of input.ranges) {
        this.debugLog(`Calculating result for range: ${JSON.stringify(range)}.`)
        results.push(mukit.calculateResult(range))
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      this.debugLog(`Error thrown: ${msg}. Responding with 422.`)
      if (e instanceof  Error) {
        this.debugLog(`Stack trace: ${e.stack}`)
      }
      res.status(422).send({ errors: [msg] })
      return
    }
    this.debugLog(`Response results: ${JSON.stringify(results, null, 2)}.`)
    res.send(results)
  }

  debugLog(msg: string) {
    if (!this.debug) {
      return
    }
    console.debug(msg)
  }
}
