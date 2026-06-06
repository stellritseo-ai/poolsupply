import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

const DEFAULT_SETTINGS = {
  _id: "global",
  maintenanceMode: false,
  paymentMethods: [
    { id: "stripe", name: "Stripe", active: true, publicKey: "pk_test_mock_123", secretKey: "sk_test_mock_456" },
    { id: "paypal", name: "PayPal Checkout", active: false, clientId: "client_mock_789", secret: "secret_mock_abc" },
    { id: "authorize", name: "Authorize.net", active: false, loginId: "login_mock_xyz", transactionKey: "trans_mock_000" }
  ]
};

export const getGlobalSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const db = await connectDB();
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
      return { success: false, error: "Failed to fetch settings." };
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
