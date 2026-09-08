import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Uploads an image to Cloudinary using the unsigned upload API.
 *
 * Required environment variables (set in Vercel dashboard + .env):
 *   CLOUDINARY_CLOUD_NAME   — your cloud name (e.g. "dxxxxxx")
 *   CLOUDINARY_UPLOAD_PRESET — an unsigned upload preset name (e.g. "pool_uploads")
 *
 * How to set up (free, no credit card):
 *  1. Sign up at https://cloudinary.com
 *  2. Go to Settings → Upload → Upload Presets → Add preset
 *  3. Set "Signing mode" to "Unsigned" and note the preset name
 *  4. Copy your Cloud Name from the dashboard home page
 *  5. Add both values to Vercel environment variables
 */
export const uploadImage = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    filename: z.string(),
    base64: z.string()
  }))
  .handler(async ({ data }) => {
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error(
          "Missing CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET environment variables. " +
          "Please add them to your Vercel project settings."
        );
      }

      // Ensure the base64 string includes the data URI prefix for Cloudinary
      const base64Data = data.base64.startsWith("data:")
        ? data.base64
        : `data:image/png;base64,${data.base64}`;

      // Build the multipart form for Cloudinary's unsigned upload endpoint
      const formData = new FormData();
      formData.append("file", base64Data);
      formData.append("upload_preset", uploadPreset);
      // Use the original filename (without extension) as the public_id folder hint
      formData.append("folder", "pool-products");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Cloudinary upload failed (${response.status}): ${errBody}`);
      }

      const result = await response.json() as { secure_url: string; public_id: string };

      return {
        success: true,
        url: result.secure_url   // HTTPS CDN URL — works everywhere, no local disk needed
      };
    } catch (e: any) {
      console.error("Failed to upload image:", e);
      return {
        success: false,
        error: e.message || "Failed to process image upload."
      };
    }
  });
