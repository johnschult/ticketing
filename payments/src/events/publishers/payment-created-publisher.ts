import { PaymentCreatedEvent, Publisher, Subjects } from '@jstickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}
