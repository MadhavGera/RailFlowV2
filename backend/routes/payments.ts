import { Router, Response } from 'express';
import Stripe from 'stripe';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/payments/create-intent
router.post('/create-intent', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;

    // 👇 FIX: Initialize Stripe INSIDE the route to avoid the .env loading bug
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { 
      apiVersion: '2026-03-25.dahlia' 
    });

    // Create a PaymentIntent (amount must be in smallest currency unit)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

export default router;