import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import crypto from "node:crypto";

// Registration
export const registerCustomer = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    identifier: z.string().min(3, "Valid Email or Mobile Number required"),
    password: z.string().min(6, "Password must be at least 6 characters")
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const customersCol = db.collection("customers");

      const isEmail = data.identifier.includes('@');
      const searchCriteria = isEmail ? { email: data.identifier } : { phone: data.identifier };

      const existing = await customersCol.findOne(searchCriteria);
      if (existing) {
        return { success: false, error: "An account with this contact info already exists." };
      }

      const bcrypt = (await import("bcryptjs")).default;
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const newCustomer: any = {
        name: data.name,
        password: hashedPassword,
        createdAt: new Date()
      };
      
      if (isEmail) newCustomer.email = data.identifier;
      else newCustomer.phone = data.identifier;

      await customersCol.insertOne(newCustomer);

      // Secure session token
      const token = crypto.randomBytes(32).toString('hex');

      return {
        success: true,
        token,
        user: { name: data.name, email: newCustomer.email, phone: newCustomer.phone }
      };
    } catch (e: any) {
      console.error("Registration Error:", e);
      return { success: false, error: "Failed to create account. Please try again." };
    }
  });

// Login
export const loginCustomer = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    identifier: z.string().min(3, "Email or Mobile Number is required"),
    password: z.string().min(1, "Password is required")
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const customersCol = db.collection("customers");

      const isEmail = data.identifier.includes('@');
      const searchCriteria = isEmail ? { email: data.identifier } : { phone: data.identifier };

      const user = await customersCol.findOne(searchCriteria);
      if (!user) {
        return { success: false, error: "Invalid credentials." };
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
        user: { name: user.name, email: user.email, phone: user.phone }
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

// Get Admin Customers with order stats
export const getAdminCustomers = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const db = await connectDB();
      const customersCol = db.collection("customers");
      const ordersCol = db.collection("orders");

      const customers = await customersCol.find().sort({ createdAt: -1 }).toArray();
      const orders = await ordersCol.find().toArray();

      const customersWithStats = customers.map(c => {
        // match by email (or phone if we added phone to orders, currently orders only have email)
        const customerOrders = orders.filter(o => o.email === c.email);
        
        const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const totalProductsPurchased = customerOrders.reduce((sum, o) => {
          return sum + (o.items || []).reduce((itemSum: number, item: any) => itemSum + (item.qty || 1), 0);
        }, 0);

        return {
          id: c._id.toString(),
          name: c.name,
          email: c.email || undefined,
          phone: c.phone || undefined,
          createdAt: c.createdAt || new Date().toISOString(),
          totalOrders: customerOrders.length,
          totalSpent,
          totalProductsPurchased
        };
      });

      return { success: true, customers: customersWithStats };
    } catch (e: any) {
      console.error("Fetch Customers Error:", e);
      return { success: false, error: "Failed to fetch customers data." };
    }
  });
