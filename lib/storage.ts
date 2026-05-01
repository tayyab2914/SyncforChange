import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/** Server-only Supabase client used for Storage uploads. Uses service role key. */
export function getStorageClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable"
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export type BucketName = "event-images" | "profile-images";

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadToBucket(
  bucket: BucketName,
  file: File,
  pathPrefix: string
): Promise<UploadResult> {
  const supabase = getStorageClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = /^[a-z0-9]{1,5}$/.test(ext) ? ext : "jpg";
  const filename = `${pathPrefix}-${crypto.randomUUID()}.${safeExt}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(filename, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return { url: data.publicUrl, path: filename };
}
