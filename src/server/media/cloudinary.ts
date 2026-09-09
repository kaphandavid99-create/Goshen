import "server-only";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { env, isCloudinaryConfigured } from "@/lib/env";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export type UploadedMedia = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  width?: number;
  height?: number;
};

function configure() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
    // Skip the SDK analytics query param; its version lookup is brittle under
    // a bundler and adds nothing for us.
    analytics: false,
  });
}

export function mediaKind(mimeType: string): "image" | "video" | null {
  if (IMAGE_TYPES.has(mimeType)) {
    return "image";
  }
  if (VIDEO_TYPES.has(mimeType)) {
    return "video";
  }
  return null;
}

export function deliveryUrl(
  publicId: string,
  resourceType: "image" | "video" = "image",
  options: { removeBackground?: boolean } = {},
) {
  configure();

  if (resourceType === "video") {
    return cloudinary.url(publicId, {
      resource_type: "video",
      secure: true,
    });
  }

  if (options.removeBackground === false) {
    return cloudinary.url(publicId, {
      resource_type: "image",
      secure: true,
      transformation: [
        { width: 1600, crop: "limit" },
        { fetch_format: "auto" },
        { quality: "auto" },
      ],
    });
  }

  return cloudinary.url(publicId, {
    resource_type: "image",
    secure: true,
    transformation: [
      { effect: "background_removal" },
      { width: 1200, crop: "limit" },
      { fetch_format: "png" },
      { quality: "auto" },
    ],
  });
}

export async function uploadMedia(
  file: File,
  options: { removeBackground?: boolean; folder?: string } = {},
): Promise<UploadedMedia> {
  const kind = mediaKind(file.type);
  if (!kind) {
    throw new Error("Use a JPG, PNG, WEBP, MP4, or WEBM file.");
  }

  const maxBytes = kind === "video" ? 40 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(
      kind === "video" ? "Videos must be under 40 MB." : "Images must be under 10 MB.",
    );
  }

  configure();
  const buffer = Buffer.from(await file.arrayBuffer());
  const removeBackground = kind === "image" && options.removeBackground !== false;
  const baseFolder = options.folder ?? "goshen/products";
  const folder = kind === "video" ? `${baseFolder}/videos` : baseFolder;

  const result = await uploadBuffer(buffer, {
    folder,
    resource_type: kind,
    ...(removeBackground ? { background_removal: "cloudinary_ai", format: "png" } : {}),
  }).catch(async (error) => {
    if (!removeBackground) {
      throw error;
    }
    return uploadBuffer(buffer, { folder, resource_type: kind });
  });

  return {
    publicId: result.public_id,
    resourceType: kind,
    width: result.width,
    height: result.height,
    url:
      kind === "image"
        ? deliveryUrl(result.public_id, "image", {
            removeBackground: options.removeBackground,
          })
        : result.secure_url,
  };
}

/**
 * Uploads a customer profile photo: no background removal, cropped square to the
 * face, delivered small. Returns the display URL + Cloudinary public id.
 */
export async function uploadAvatar(file: File): Promise<UploadedMedia> {
  if (mediaKind(file.type) !== "image") {
    throw new Error("Use a JPG, PNG, or WEBP image.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Images must be under 5 MB.");
  }

  configure();
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadBuffer(buffer, {
    folder: "goshen/avatars",
    resource_type: "image",
  });

  const url = cloudinary.url(result.public_id, {
    resource_type: "image",
    secure: true,
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { fetch_format: "auto" },
      { quality: "auto" },
    ],
  });

  return {
    publicId: result.public_id,
    resourceType: "image",
    width: result.width,
    height: result.height,
    url,
  };
}

function uploadBuffer(
  buffer: Buffer,
  options: Record<string, unknown>,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, uploaded) => {
      if (error || !uploaded) {
        reject(error ?? new Error("Upload failed."));
        return;
      }
      resolve(uploaded);
    });
    stream.end(buffer);
  });
}

export async function destroyMedia(
  publicId: string,
  resourceType: "image" | "video" = "image",
) {
  configure();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
