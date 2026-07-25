import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const createStripePaymentIntentDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    amount: z.number(),
    currency: z.string().default("usd"),
    email: z.string().optional(),
    description: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const secretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY;

    const amountInCents = Math.round(data.amount * 100);

    if (secretKey) {
      try {
        const bodyParams = new URLSearchParams();
        bodyParams.append("amount", amountInCents.toString());
        bodyParams.append("currency", data.currency.toLowerCase());
        if (data.email) bodyParams.append("receipt_email", data.email);
        if (data.description) bodyParams.append("description", data.description);

        const response = await fetch("https://api.stripe.com/v1/payment_intents", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${secretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: bodyParams.toString(),
        });

        const resData = await response.json();

        if (response.ok && resData.client_secret) {
          return {
            success: true,
            isLive: true,
            clientSecret: resData.client_secret,
            publishableKey: publishableKey || "",
            paymentIntentId: resData.id,
          };
        } else {
          console.error("Stripe API Error:", resData);
          return {
            success: false,
            error: resData.error?.message || "Failed to create Stripe payment intent.",
          };
        }
      } catch (err: any) {
        console.error("Stripe Connection Error:", err);
        return {
          success: false,
          error: err.message || "Failed to connect to Stripe server.",
        };
      }
    }

    // Demo Mode fallback when STRIPE_SECRET_KEY is not yet in .env
    return {
      success: true,
      isLive: false,
      clientSecret: `pi_demo_${Math.random().toString(36).slice(2)}_secret_${Math.random().toString(36).slice(2)}`,
      publishableKey: publishableKey || "pk_test_demo_key",
      message: "Stripe Payment Ready. Add STRIPE_SECRET_KEY & VITE_STRIPE_PUBLISHABLE_KEY to your .env file to enable live card charges.",
    };
  });

export const getStripeConfigDb = createServerFn({ method: "POST" })
  .handler(async () => {
    const secretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY;

    return {
      isConfigured: !!secretKey,
      publishableKey: publishableKey || "",
    };
  });
