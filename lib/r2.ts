import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
/** Optional: public base URL for objects (e.g. https://pub-xxx.r2.dev or custom domain) */
const publicBaseUrl = process.env.R2_PUBLIC_URL;

/** S3 endpoint without path (R2_ENDPOINT may include /bucket). */
function getEndpointUrl(): string | null {
  if (!endpoint?.trim()) return null;
  try {
    const u = new URL(endpoint.trim());
    u.pathname = "";
    u.search = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function getClient(): S3Client | null {
  const endpointUrl = getEndpointUrl();
  if (!endpointUrl || !accessKeyId || !secretAccessKey || !bucketName) {
    return null;
  }
  return new S3Client({
    region: "auto",
    endpoint: endpointUrl,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

export type UploadResult = { url: string; key: string } | { error: string };

/**
 * Upload a file buffer to R2. Key will be: submissions/{challengeId}/{teamId}/{slug}_{timestamp}_{safeName}
 * Returns public URL if R2_PUBLIC_URL is set, otherwise returns key (client can use signed URL later if needed).
 */
export async function uploadSubmissionFile(
  challengeId: number,
  teamId: number,
  slug: string,
  originalName: string,
  body: Buffer,
  contentType: string
): Promise<UploadResult> {
  const client = getClient();
  if (!client) {
    return { error: "R2 is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME." };
  }

  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const timestamp = Date.now();
  const key = `submissions/${challengeId}/${teamId}/${slug}_${timestamp}_${safeName}`;

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName!,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
  } catch (e) {
    console.error("R2 upload error:", e);
    return { error: "Upload failed." };
  }

  const url = publicBaseUrl
    ? `${publicBaseUrl.replace(/\/$/, "")}/${key}`
    : key;
  return { url, key };
}

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3MB

/**
 * Upload a user avatar to R2. Key: avatars/{userId}/{timestamp}.{ext}
 * Returns public URL or key. Validates type and size.
 */
export async function uploadAvatar(
  userId: string,
  body: Buffer,
  contentType: string,
  originalName: string
): Promise<UploadResult> {
  if (!ALLOWED_AVATAR_TYPES.includes(contentType)) {
    return { error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." };
  }
  if (body.length > MAX_AVATAR_BYTES) {
    return { error: "File too large. Maximum size is 3MB." };
  }

  const client = getClient();
  if (!client) {
    return {
      error:
        "Avatar upload is not configured. Set R2 environment variables.",
    };
  }

  const ext =
    contentType === "image/jpeg"
      ? "jpg"
      : contentType === "image/png"
        ? "png"
        : contentType === "image/webp"
          ? "webp"
          : "gif";
  const key = `avatars/${userId}/${Date.now()}.${ext}`;

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName!,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
  } catch (e) {
    console.error("R2 avatar upload error:", e);
    return { error: "Upload failed." };
  }

  const url = publicBaseUrl
    ? `${publicBaseUrl.replace(/\/$/, "")}/${key}`
    : key;
  return { url, key };
}
