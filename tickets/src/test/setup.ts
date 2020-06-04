import { MongoMemoryServer } from 'mongodb-memory-server'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

jest.mock('../')

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[]
      mongoId(): string
    }
  }
}

jest.mock('../nats-wrapper.ts')

let mongo: any
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf'
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

beforeEach(async () => {
  jest.clearAllMocks()
  const collections = await mongoose.connection.db.collections()

  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

global.signin = () => {
  const payload = {
    id: global.mongoId(),
    email: 'test@test.com',
  }

  const token = jwt.sign(payload, process.env.JWT_KEY!)
  const session = { jwt: token }
  const sessionJSON = JSON.stringify(session)
  const base64 = Buffer.from(sessionJSON).toString('base64')

  return [`express:sess=${base64}`]
}

global.mongoId = () => new mongoose.Types.ObjectId().toHexString()
