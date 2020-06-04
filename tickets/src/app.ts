import 'express-async-errors'

import { NotFoundError, currentUser, errorHandler } from '@jstickets/common'

import cookieSession from 'cookie-session'
import { createTicketRouter } from './routes/new'
import express from 'express'
import { indexTicketRouter } from './routes/index'
import { json } from 'body-parser'
import { showTicketRouter } from './routes/show'
import { updateTicketRouter } from './routes/update'

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

app.use(createTicketRouter)
app.use(showTicketRouter)
app.use(updateTicketRouter)
app.use(indexTicketRouter)

app.all('*', async (req, res) => {
  throw new NotFoundError()
})

app.use(errorHandler)

export { app }
