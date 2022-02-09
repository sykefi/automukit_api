import 'dotenv/config'
import express from 'express'
import * as http from 'http'
import MUKit from './mukit'
import { Input } from '../types'
import Validator from './validator'

export default class Server {
  static instance?: Server
  private server?: http.Server

  constructor() {
    if (Server.instance) {
      return Server.instance
    }
    Server.instance = this
  }

  start(): http.Server {
    const date = new Date()
    console.log(`${date.toJSON()} - Starting AutoMUKit API server...`)
    const app = express()
    app.use(express.json())
    app.set('view engine', 'pug')
    app.get('/', function (req, res) {
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
    const contentType = req.get('Content-type')
    if (!contentType || contentType.indexOf('application/json') === -1) {
      res.sendStatus(415)
      return
    }
    const errors = Validator.validateInputFormat(req.body)
    if (errors.length > 0) {
      res.status(400).send({ errors })
    } else {
      const results = []
      try {
        const input = req.body as Input
        const mukit = new MUKit(input)
        for (const range of input.ranges) {
          results.push(mukit.calculateResult(range))
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        res.status(422).send({ errors: [msg] })
        return
      }
      res.send(results)
    }
  }
}
