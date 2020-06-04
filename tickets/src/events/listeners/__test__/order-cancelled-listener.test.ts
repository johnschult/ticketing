import { OrderCancelledEvent, OrderStatus } from '@jstickets/common'

import { Message } from 'node-nats-streaming'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { Ticket } from '../../../models/ticket'
import mongoose from 'mongoose'
import { natsWrapper } from '../../../nats-wrapper'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const orderId = mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'asdf',
  })

  ticket.set({ orderId })

  await ticket.save()

  //  create fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg, orderId }
}

it('updates the ticket, publishes an event, and acks the message', async () => {
  const { listener, msg, data, ticket } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.orderId).toBeUndefined()
  expect(msg.ack).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
