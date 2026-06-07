import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import crypto from "node:crypto";

// Registration
export const registerCustomer = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const customersCol = db.collection("customers");

      const existing = await customersCol.findOne({ email: data.email });
      if (existing) {
        return { success: false, error: "An account with this email already exists." };
      }

      const bcrypt = (await import("bcryptjs")).default;
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const newCustomer = {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        createdAt: new Date()
      };

      await customersCol.insertOne(newCustomer);

      // Secure session token
      const token = crypto.randomBytes(32).toString('hex');

      return {
        success: true,
        token,
        user: { name: data.name, email: data.email }
      };
    } catch (e: any) {
      console.error("Registration Error:", e);
      return { success: false, error: "Failed to create account. Please try again." };
    }
  });

// Login
export const loginCustomer = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const customersCol = db.collection("customers");

      const user = await customersCol.findOne({ email: data.email });
      if (!user) {
        return { success: false, error: "Invalid email or password." };
      }

      const bcrypt = (await import("bcryptjs")).default;
      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        return { success: false, error: "Invalid email or password." };
      }

      const token = crypto.randomBytes(32).toString('hex');

      return {
        success: true,
        token,
        user: { name: user.name, email: user.email }
      };
    } catch (e: any) {
      console.error("Login Error:", e);
      return { success: false, error: "Failed to log in. Please try again." };
    }
  });

// Get Customer Orders
export const getCustomerOrders = createServerFn({ method: "GET" })
  .inputValidator(z.object({ email: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const ordersCol = db.collection("orders");

      const orders = await ordersCol.find({ email: data.email }).sort({ placedAt: -1 }).toArray();

      const formatted = orders.map(o => ({
        id: o.id || o._id.toString(),
        placedAt: o.placedAt || new Date().toISOString(),
        email: o.email,
        name: o.name,
        items: o.items || [],
        subtotal: o.subtotal,
        shipping: o.shipping,
        tax: o.tax,
        total: o.total,
        status: o.status || "Pending",
        method: o.method || "standard"
      }));

      return { success: true, orders: formatted };
    } catch (e: any) {
      console.error("Fetch Orders Error:", e);
      return { success: false, error: "Failed to fetch orders." };
    }
  });
