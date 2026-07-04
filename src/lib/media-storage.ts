import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type MediaStorageConfig = {
  projectUrl: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

function readMediaStorageConfig(): MediaStorageConfig {
  const projectUrl = process.env.SUPABASE_PROJECT_URL;
  const endpoint = process.env.SUPABASE_STORAGE_S3_ENDPOINT;
  const region = process.env.SUPABASE_STORAGE_S3_REGION;
  const accessKeyId = process.env.SUPABASE_STORAGE_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;

  if (!projectUrl) throw new Error("SUPABASE_PROJECT_URL is not set");
  if (!endpoint) throw new Error("SUPABASE_STORAGE_S3_ENDPOINT is not set");
  if (!region) throw new Error("SUPABASE_STORAGE_S3_REGION is not set");
  if (!accessKeyId) throw new Error("SUPABASE_STORAGE_S3_ACCESS_KEY_ID is not set");
  if (!secretAccessKey) throw new Error("SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY is not set");
  if (!bucket) throw new Error("SUPABASE_STORAGE_BUCKET is not set");

  return { projectUrl, endpoint, region, accessKeyId, secretAccessKey, bucket };
}

function createS3Client(config: MediaStorageConfig) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function sanitizeFileName(name: string) {
  const lastDotIndex = name.lastIndexOf(".");
  const baseName = lastDotIndex > 0 ? name.slice(0, lastDotIndex) : name;
  const extension = lastDotIndex > 0 ? name.slice(lastDotIndex).toLowerCase() : "";
  const safeBaseName = baseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${safeBaseName || "image"}${extension}`;
}

function encodeObjectPath(objectPath: string) {
  return objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildPublicUrl(projectUrl: string, bucket: string, objectPath: string) {
  return new URL(
    `/storage/v1/object/public/${bucket}/${encodeObjectPath(objectPath)}`,
    projectUrl,
  ).toString();
}

export async function uploadMediaObject(input: {
  file: File;
  articleId: number | null;
}) {
  const config = readMediaStorageConfig();
  const client = createS3Client(config);
  const objectPath = [
    "articles",
    input.articleId === null ? "unattached" : String(input.articleId),
    `${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(input.file.name)}`,
  ].join("/");

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: objectPath,
      Body: Buffer.from(await input.file.arrayBuffer()),
      ContentType: input.file.type,
    }),
  );

  return {
    bucket: config.bucket,
    objectPath,
    publicUrl: buildPublicUrl(config.projectUrl, config.bucket, objectPath),
  };
}

export async function deleteMediaObject(input: { bucket: string; objectPath: string }) {
  const config = readMediaStorageConfig();
  const client = createS3Client(config);

  await client.send(
    new DeleteObjectCommand({
      Bucket: input.bucket,
      Key: input.objectPath,
    }),
  );
}
