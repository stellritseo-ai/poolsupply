import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

const DEFAULT_SETTINGS = {
  _id: "global",
  maintenanceMode: false,
  paymentMethods: [
    {
      id: "stripe",
      name: "Stripe Live Payments",
      active: true,
      publicKey: "pk_live_51TxoN3LlienmBCcZCAlvmfLnIsLe0BaWwIaBTSm8CrVBjuh7dPLzpHbe9QXiWKR9zxPYdBqJNbEoPNDCSGWcL5C900sY0uRiB2",
      mode: "Live Production (256-bit SSL)"
    },
    { id: "paypal", name: "PayPal Wholesale", active: false, mode: "Standard" },
    { id: "authorize", name: "Authorize.net", active: false, mode: "Commercial B2B" }
  ]
};

export const getGlobalSettings = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) {
        return { 
          success: true, 
          settings: {
            maintenanceMode: false,
            paymentMethods: DEFAULT_SETTINGS.paymentMethods
          } 
        };
      }
      const settingsCol = db.collection("settings");
      let settings = await settingsCol.findOne({ _id: "global" as any }) as any;

      if (!settings) {
        await settingsCol.insertOne(DEFAULT_SETTINGS as any);
        settings = DEFAULT_SETTINGS;
      }

      return { 
        success: true, 
        settings: {
          maintenanceMode: settings.maintenanceMode,
          paymentMethods: settings.paymentMethods
        } 
      };
    } catch (e: any) {
      console.error("Settings fetch error:", e);
      return { 
        success: true, 
        settings: {
          maintenanceMode: false,
          paymentMethods: DEFAULT_SETTINGS.paymentMethods
        } 
      };
    }
  });

export const updateGlobalSettings = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    maintenanceMode: z.boolean().optional(),
    paymentMethods: z.array(z.any()).optional()
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: false, error: "Database connection unavailable." };
      }
      const settingsCol = db.collection("settings");
      
      const updateData: any = {};
      if (typeof data.maintenanceMode === "boolean") updateData.maintenanceMode = data.maintenanceMode;
      if (data.paymentMethods) updateData.paymentMethods = data.paymentMethods;

      await settingsCol.updateOne(
        { _id: "global" as any },
        { $set: updateData },
        { upsert: true }
      );

      return { success: true };
    } catch (e: any) {
      console.error("Settings update error:", e);
      return { success: false, error: "Failed to update settings." };
    }
  });
