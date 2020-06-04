import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'
import { TicketUpdatedEvent } from '@jstickets/common'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import mongoose from 'mongoose'
import { natsWrapper } from '../../../nats-wrapper'

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  })
  await ticket.save()

  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: ticket.title,
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(),
  }

  // create a fake Message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg, ticket }
}

it('finds, updates and saves a ticket', async () => {
  const { listener, data, msg, ticket } = await setup()
  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if the event has a skipped version number', async () => {
  const { listener, data, msg } = await setup()

  data.version = 10
  try {
    await listener.onMessage(data, msg)
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled()
})
