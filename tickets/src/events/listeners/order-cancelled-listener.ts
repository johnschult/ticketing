import { Listener, OrderCancelledEvent, Subjects } from '@jstickets/common'

import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'
import { queueGroupName } from './queue-group-name'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled
  queueGroupName = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    //  find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id)

    //  if no ticket, throw error
    if (!ticket) throw new Error('Ticket not found')

    // mark the ticket as available by setting the orderId property to null
    ticket.set({ orderId: undefined })

    //  save the ticket
    await ticket.save()

    //  publish the update event
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    })

    // ack the message
    msg.ack()
  }
}
