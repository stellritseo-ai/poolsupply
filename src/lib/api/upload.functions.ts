import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const uploadImage = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    filename: z.string(),
    base64: z.string()
  }))
  .handler(async ({ data }) => {
    try {
      // Strip out the data URI prefix if it exists (e.g., data:image/png;base64,...)
      const matches = data.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      
      if (matches && matches.length === 3) {
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(data.base64, 'base64');
      }

      const path = await import("path");
      const fs = await import("fs/promises");

      // Generate a clean, unique filename
      const ext = path.extname(data.filename) || '.png';
      const safeName = path.basename(data.filename, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const newFilename = `${safeName}-${Date.now()}${ext}`;
      
      // Absolute path to the public/uploads directory
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const filepath = path.join(uploadDir, newFilename);
      
      // Ensure the directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      
      // Save the file to disk
      await fs.writeFile(filepath, buffer);
      
      return {
        success: true,
        url: `/uploads/${newFilename}` // The public URL accessible from the browser
      };
    } catch (e: any) {
      console.error("Failed to upload image:", e);
      return {
        success: false,
        error: e.message || "Failed to process image upload on the server."
      };
    }
  });
