import mongoose, { mongo } from 'mongoose'

import { OrderStatus } from '@jstickets/common'
import { Ticket } from '../../models/ticket'
import { app } from '../../app'
import { natsWrapper } from '../../nats-wrapper'
import request from 'supertest'

it('marks an order as cancelled', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  })
  await ticket.save()

  const user = global.signin()

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200)

  expect(fetchedOrder.status).toEqual(OrderStatus.Cancelled)
})

it('emits an order:cancelled event', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),

    title: 'concert',
    price: 20,
  })
  await ticket.save()

  const user = global.signin()

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
