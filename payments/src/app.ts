import 'express-async-errors'

import { NotFoundError, currentUser, errorHandler } from '@jstickets/common'

import cookieSession from 'cookie-session'
import { createChargeRouter } from './routes/new'
import express from 'express'
import { json } from 'body-parser'

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
)
app.use(currentUser)

app.use(createChargeRouter)

app.all('*', async (req, res) => {
  throw new NotFoundError()
})

app.use(errorHandler)

export { app }
