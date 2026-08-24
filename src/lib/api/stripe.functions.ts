import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// SECURITY: Keys must ONLY come from environment variables — never hardcoded
function getSecretKey(): string {
  const k =
    process.env.STRIPE_SECRET_KEY ||
    (typeof (globalThis as any).process !== "undefined" ? (globalThis as any).process?.env?.STRIPE_SECRET_KEY : undefined);

  if (typeof k === "string" && k.trim() && (k.startsWith("sk_live_") || k.startsWith("sk_test_"))) {
    return k.trim();
  }
  // Fail loudly rather than silently falling back to an exposed key
  throw new Error("STRIPE_SECRET_KEY environment variable is not set or invalid.");
}

function getPublishableKey(): string {
  const envKey =
    process.env.STRIPE_PUBLISHABLE_KEY ||
    (typeof (globalThis as any).process !== "undefined" ? (globalThis as any).process?.env?.STRIPE_PUBLISHABLE_KEY : undefined);

  if (typeof envKey === "string" && (envKey.startsWith("pk_live_") || envKey.startsWith("pk_test_"))) {
    return envKey.trim();
  }
  throw new Error("STRIPE_PUBLISHABLE_KEY environment variable is not set or invalid.");
}

function normalizeCountryCode(country?: string): string {
  if (!country) return "US";
  const c = country.trim().toUpperCase();
  if (c.length === 2) return c;
  if (c === "UNITED STATES" || c === "USA" || c === "UNITED STATES OF AMERICA") return "US";
  if (c === "CANADA") return "CA";
  if (c === "UNITED KINGDOM" || c === "UK" || c === "GREAT BRITAIN") return "GB";
  if (c === "AUSTRALIA") return "AU";
  if (c === "MEXICO") return "MX";
  return "US";
}

const AddressInputSchema = z.object({
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
}).optional();

export const createStripePaymentIntentDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    amount: z.number(),
    currency: z.string().default("usd"),
    tokenId: z.string().optional(),
    paymentMethodId: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    description: z.string().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
    cardName: z.string().optional(),
    address: AddressInputSchema,
  }))
  .handler(async ({ data }) => {
    const secretKey = getSecretKey();
    const publishableKey = getPublishableKey();
    const isLive = secretKey.startsWith("sk_live_");
    console.log(`[Stripe] Mode: ${isLive ? "LIVE" : "TEST"} | Key prefix: ${secretKey.slice(0, 14)}...`);

    if (!isLive) {
      return {
        success: false,
        error: "Payment gateway is configured in test mode. Please contact support.",
      };
    }

    const amountInCents = Math.round(data.amount * 100);

    if (amountInCents < 50) {
      return {
        success: false,
        error: "Order amount must be at least $0.50 for Stripe card processing.",
      };
    }

    try {
      const piParams = new URLSearchParams();
      piParams.append("amount", amountInCents.toString());
      piParams.append("currency", data.currency.toLowerCase());
      if (data.email) piParams.append("receipt_email", data.email.trim());
      if (data.description) piParams.append("description", data.description);

      if (data.metadata) {
        Object.entries(data.metadata).forEach(([key, val]) => {
          if (val) piParams.append(`metadata[${key}]`, String(val).slice(0, 500));
        });
      }

      piParams.append("automatic_payment_methods[enabled]", "true");

      const tokenOrPm = data.paymentMethodId || data.tokenId;
      if (tokenOrPm) {
        piParams.append("payment_method", tokenOrPm);
        piParams.append("confirm", "true");
        piParams.append("automatic_payment_methods[allow_redirects]", "never");
      }

      // Add shipping information if available
      const customerName = data.cardName || data.metadata?.customer_name || "Commercial Customer";
      piParams.append("shipping[name]", customerName);
      if (data.phone || data.metadata?.customer_phone) {
        piParams.append("shipping[phone]", (data.phone || data.metadata?.customer_phone || "").trim());
      }
      if (data.address?.line1) {
        piParams.append("shipping[address][line1]", data.address.line1.trim());
      }
      if (data.address?.line2) {
        piParams.append("shipping[address][line2]", data.address.line2.trim());
      }
      if (data.address?.city) {
        piParams.append("shipping[address][city]", data.address.city.trim());
      }
      if (data.address?.state) {
        piParams.append("shipping[address][state]", data.address.state.trim());
      }
      if (data.address?.zip) {
        piParams.append("shipping[address][postal_code]", data.address.zip.trim());
      }
      piParams.append("shipping[address][country]", normalizeCountryCode(data.address?.country));

      const piRes = await fetch("https://api.stripe.com/v1/payment_intents", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: piParams.toString(),
      });

      const piData = await piRes.json();

      if (
        piRes.ok &&
        piData.id &&
        (piData.status === "succeeded" ||
          piData.status === "processing" ||
          piData.status === "requires_capture" ||
          piData.client_secret)
      ) {
        return {
          success: true,
          isLive,
          paymentIntentId: piData.id,
          clientSecret: piData.client_secret,
          publishableKey,
          status: piData.status,
          chargeId: piData.latest_charge || null,
          amount: (piData.amount / 100).toFixed(2),
          currency: piData.currency?.toUpperCase() || "USD",
        };
      }

      console.error("Stripe Payment Intent Creation Error:", piData);
      return {
        success: false,
        error: piData.error?.message || "Failed to initialize Stripe Live payment intent.",
      };
    } catch (err: any) {
      console.error("Stripe Gateway Error:", err);
      return {
        success: false,
        error: err.message || "Failed to communicate with Stripe Live Payment Gateway.",
      };
    }
  });

export const getStripeConfigDb = createServerFn({ method: "POST" })
  .handler(async () => {
    const secretKey = getSecretKey();
    const publishableKey = getPublishableKey();

    return {
      isConfigured: true,
      isLive: true,
      publishableKey,
    };
  });

export const verifyStripeLiveConnectionDb = createServerFn({ method: "POST" })
  .handler(async () => {
    const secretKey = getSecretKey();
    const isLive = secretKey.startsWith("sk_live_");

    try {
      const res = await fetch("https://api.stripe.com/v1/balance", {
        headers: {
          "Authorization": `Bearer ${secretKey}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        return {
          success: true,
          isLive,
          livemode: data.livemode,
          status: "Live and Ready",
          currencies: (data.available || []).map((b: any) => b.currency.toUpperCase()),
        };
      } else {
        return {
          success: false,
          isLive,
          error: data.error?.message || "Stripe authentication failed.",
        };
      }
    } catch (err: any) {
      return {
        success: false,
        isLive,
        error: err.message || "Could not reach Stripe servers.",
      };
    }
  });
