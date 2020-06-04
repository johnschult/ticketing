import { Ticket } from '../../models/ticket'
import { app } from '../../app'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'
import request from 'supertest'

it('returns a 404 if the provided id does not exist', async () => {
  await request(app)
    .put(`/api/tickets/${global.mongoId()}`)
    .set('Cookie', global.signin())
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(404)
})

it('returns a 401 if the user is not authenticated', async () => {
  await request(app)
    .put(`/api/tickets/${global.mongoId()}`)
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(401)
})

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'new title',
      price: 10,
    })
    .expect(401)
})

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      price: 20,
    })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: -20,
    })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
    })
    .expect(400)
})

it('updates the ticket if the user provided valid inputs', async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 10,
    })
    .expect(200)

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()

  expect(ticketResponse.body.title).toEqual('new title')
  expect(ticketResponse.body.price).toEqual(10)
})

it('publishes an event', async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 10,
    })
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects updates if the ticket is reserved', async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 20,
    })
    .expect(201)

  const ticket = await Ticket.findById(response.body.id)
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() })
  await ticket!.save()

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 50,
    })
    .expect(400)
})
