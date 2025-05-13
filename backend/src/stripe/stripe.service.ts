import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private logger = new Logger(StripeService.name);

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil',
    });
  }

  async createCustomer(email: string): Promise<Stripe.Customer> {
    const customers = await this.stripe.customers.list({ email });
    if (customers.data.length > 0) {
      return customers.data[0];
    }
    return this.stripe.customers.create({ email });
  }

  async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async constructEvent(payload: Buffer, signature: string, endpointSecret: string): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (err) {
      this.logger.error('Webhook signature verification failed.', err);
      throw err;
    }
  }
}
