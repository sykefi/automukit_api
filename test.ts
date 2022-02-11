import Server from './src/modules/server'
import SuperTest from 'supertest'
import validInput from './fixtures/inputRelative.json'
import absInput from './fixtures/inputAbsolute.json'
import multiRefInput from './fixtures/inputMultiRef.json'
import multiRangeInput from './fixtures/inputRelativeMultiRange.json'
const server = new Server()
const request = SuperTest(server.start())

afterAll(() => {
  return server.stop()
})

describe('GET', () => {
  it('should return 200', async () => {
    const res = await request.get('/').type('text/html')
    expect(res.status).toEqual(200)
  })
})

describe('POST', () => {
  it('should return 415 if Content-type is not application/json', async () => {
    const res = await request.post('/').send('some text').type('text')
    expect(res.status).toEqual(415)
  })

  it('should return 400 if request body is not valid json', async () => {
    const res = await request.post('/').send('not json').type('application/json')
    expect(res.status).toEqual(400)
  })

  it('should return 400 if input has invalid format', async () => {
    // Make deep clone
    const invalidInput = JSON.parse(JSON.stringify(validInput))
    invalidInput.data = ''
    invalidInput.references[0].uncertainty = undefined
    invalidInput.ranges[0].coverageFactor = null
    const res = await request.post('/').send(invalidInput).type('application/json')
    expect(res.status).toEqual(400)
    expect(res.body).toEqual({
      errors: [
        '"data" is not an array',
        '"uncertainty" is missing from reference',
        '"coverageFactor" is missing from range'
      ]
    })
  })

  it('should return 422 if input has invalid data', async () => {
    // Make deep clone
    const invalidInput = JSON.parse(JSON.stringify(validInput))
    invalidInput.data = [[10.0, 'yyy', 'xxx']]
    const res = await request.post('/').send(invalidInput).type('application/json')
    expect(res.status).toEqual(422)
    expect(res.body).toEqual({
      errors: ['Cannot convert "yyy" to a number']
    })
  })

  it('should return 200 and valid results for relative mode', async () => {
    const res = await request.post('/').send(validInput).type('application/json')
    expect(res.status).toEqual(200)
    expect(res.body).toEqual([
      {
        uRw: 8.82,
        ub: 2.67,
        expandedUncertainty: 18.44,
        uncertainty: 9.22,
        range: {
          coverageFactor: 2,
          min: 1,
          max: 20,
          mode: 'relative'
        }
      }
    ])
  })

  it('should return 200 and errors for invalid range settings', async () => {
    // Make deep clone
    const invalidInput = JSON.parse(JSON.stringify(validInput))
    invalidInput.ranges[0].coverageFactor = 'xxx'
    const res = await request.post('/').send(invalidInput).type('application/json')
    expect(res.status).toEqual(200)
    expect(res.body).toEqual([
      {
        errors: ['Range "coverageFactor" is not a number'],
        range: {
          coverageFactor: 'xxx',
          min: 1,
          max: 20,
          mode: 'relative'
        }
      }
    ])
  })

  it('should return 200 and valid results for absolute mode', async () => {
    const res = await request.post('/').send(absInput).type('application/json')
    expect(res.status).toEqual(200)
    expect(res.body).toEqual([
      {
        uRw: 1.61,
        ub: 1.9,
        expandedUncertainty: 4.97,
        uncertainty: 2.49,
        range: {
          coverageFactor: 2,
          min: 0,
          max: 100,
          mode: 'absolute'
        }
      }
    ])
  })

  it('should return 200 and valid results for multiple refs', async () => {
    const res = await request.post('/').send(multiRefInput).type('application/json')
    expect(res.status).toEqual(200)
    expect(res.body).toEqual([
      {
        uRw: 5.97,
        ub: 5.25,
        expandedUncertainty: 15.9,
        uncertainty: 7.95,
        range: {
          coverageFactor: 2,
          min: 1,
          max: 100,
          mode: 'relative'
        }
      }
    ])
  })

  it('should return 200 and valid results for multiple ranges', async () => {
    const res = await request.post('/').send(multiRangeInput).type('application/json')
    expect(res.status).toEqual(200)
    expect(res.body).toEqual([
      {
        uRw: 8.82,
        ub: 2.67,
        expandedUncertainty: 18.44,
        uncertainty: 9.22,
        range: {
          coverageFactor: 2,
          min: 1,
          max: 20,
          mode: 'relative'
        }
      },
      {
        uRw: 9.38,
        ub: 2.67,
        expandedUncertainty: 29.25,
        uncertainty: 9.75,
        range: {
          coverageFactor: 3,
          min: 10,
          max: 20,
          mode: 'relative'
        }
      },
      {
        errors: ['Empty data', 'Empty references'],
        range: {
          coverageFactor: 3,
          min: 100,
          max: 200,
          mode: 'relative'
        }
      }
    ])
  })
})
