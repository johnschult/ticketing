import { ExpirationCompleteEvent, Publisher, Subjects } from '@jstickets/common'

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}
