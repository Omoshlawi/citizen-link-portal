import { apiFetch } from './apiFetch';
import { constructUrl } from './constructUrl';
import httpClient from './httpClient';

export const uploadFile = async (file: File) => {
  // Step 1: Request signed URL from the API
  const requestUrl = constructUrl('/files/upload-url', {
    fileName: file.name,
    size: file.size,
    mimeType: file.type,
  });

  const requestResp = await apiFetch<{ url: string; key: string }>(requestUrl);
  const signedUrl = requestResp.data.url;
  const key = requestResp.data.key;
  // Step 2: Upload file directly to S3 using the signed URL
  await httpClient.put(signedUrl, file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      Accept: undefined,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 300000, // 5 minute timeout for large files
  });

  return key;
};

/** Upload one non-document asset (e.g. logo) to the public static bucket; returns the S3 key. */
export const uploadStaticFile = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('file', file);
  // Post straight through httpClient (like uploadFile's PUT) so axios sets the
  // multipart boundary; apiFetch would force application/json.
  const res = await httpClient.post<{ key: string }>('/api/files/upload?type=static', form, {
    headers: { Accept: 'application/json' },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 300000,
  });

  return res.data.key;
};
