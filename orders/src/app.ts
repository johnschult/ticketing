import 'express-async-errors'

import { NotFoundError, currentUser, errorHandler } from '@jstickets/common'

import cookieSession from 'cookie-session'
import { createOrderRouter } from './routes/create'
import { deleteOrderRouter } from './routes/delete'
import express from 'express'
import { indexOrderRouter } from './routes/index'
import { json } from 'body-parser'
import { showOrderRouter } from './routes/show'

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

app.use(createOrderRouter)
app.use(showOrderRouter)
app.use(deleteOrderRouter)
app.use(indexOrderRouter)

app.all('*', async (req, res) => {
  throw new NotFoundError()
})

app.use(errorHandler)

export { app }
