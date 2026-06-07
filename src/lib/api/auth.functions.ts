import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import crypto from "node:crypto";

export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const usersCol = db.collection("users");

      // Seed the default user if the collection is empty to ensure the requested credentials work
      const userCount = await usersCol.countDocuments();
      const bcrypt = (await import("bcryptjs")).default;
      const hashedPassword = await bcrypt.hash("pools12", 10);

      if (userCount === 0) {
        await usersCol.insertOne({
          username: "pools",
          password: hashedPassword,
          role: "admin",
          createdAt: new Date()
        });
        console.log("Database seeded with default admin credentials (encrypted).");
      } else {
        // Guarantee that the default 'pools' user uses 'pools12' password
        const poolsUser = await usersCol.findOne({ username: "pools" });
        if (poolsUser) {
          const isMatch = await bcrypt.compare("pools12", poolsUser.password);
          if (!isMatch && poolsUser.password !== "pools12") {
            await usersCol.updateOne(
              { username: "pools" },
              { $set: { password: hashedPassword } }
            );
            console.log("Updated default admin password to pools12.");
          }
        }
      }

      // Authenticate
      const user = await usersCol.findOne({ username: data.username });

      if (!user) {
        return { success: false, error: "Invalid username or password." };
      }

      // Handle legacy plaintext passwords and migrate them to bcrypt hashes
      if (user.password === data.password) {
        const bcrypt = (await import("bcryptjs")).default;
        const newHashedPassword = await bcrypt.hash(data.password, 10);
        await usersCol.updateOne(
          { _id: user._id },
          { $set: { password: newHashedPassword } }
        );
      } else {
        // Standard secure bcrypt comparison
        const bcrypt = (await import("bcryptjs")).default;
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
          return { success: false, error: "Invalid username or password." };
        }
      }

      // Generate a secure token for the client session
      const token = crypto.randomBytes(32).toString('hex');

      return {
        success: true,
        token,
        user: {
          username: user.username,
          role: user.role
        }
      };
    } catch (e: any) {
      console.error("Login Error:", e);
      return { success: false, error: `Login Error: ${e.message || String(e)}` };
    }
  });
