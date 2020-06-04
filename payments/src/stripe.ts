import ProxyAgent from 'https-proxy-agent'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2020-03-02',
  // @ts-ignore
  httpAgent: new ProxyAgent({
    host: 'sub.proxy.att.com',
    port: 8080,
  }),
})
