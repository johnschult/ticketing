import { TicketCreatedPublisher } from './events/ticket-created-publisher'
import nats from 'node-nats-streaming'
import { randomBytes } from 'crypto'

console.clear()

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
})

stan.on('connect', async () => {
  const publisher = new TicketCreatedPublisher(stan)
  const data = {
    id: '123',
    title: 'concert',
    price: 20,
  }

  await publisher.publish(data)
})
