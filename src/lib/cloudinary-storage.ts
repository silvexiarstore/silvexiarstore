const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "";
const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() || "";

function ensureCloudinaryConfig() {
  const required: Array<[string, string]> = [
    ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", cloudinaryCloudName],
    ["NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET", cloudinaryUploadPreset],
  ];

  const missing = required
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing Cloudinary env vars: ${missing.join(", ")}`);
  }
}

function splitPath(filePath: string) {
  const normalized = filePath.replace(/\\+/g, "/").replace(/^\/+/, "");
  const lastSlash = normalized.lastIndexOf("/");

  if (lastSlash === -1) {
    return { folder: "", filename: normalized };
  }

  return {
    folder: normalized.slice(0, lastSlash),
    filename: normalized.slice(lastSlash + 1),
  };
}

function removeExtension(filename: string) {
  return filename.replace(/\.[^./\\]+$/, "");
}

export async function uploadFileToCloudinary(file: File, filePath: string): Promise<string> {
  ensureCloudinaryConfig();

  const { folder, filename } = splitPath(filePath);
  const publicId = removeExtension(filename);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryUploadPreset);
  if (folder) formData.append("folder", folder);
  if (publicId) formData.append("public_id", publicId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = (await response.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.secure_url) {
    const reason = payload.error?.message || "Cloudinary upload failed.";
    throw new Error(reason);
  }

  return payload.secure_url;
}
