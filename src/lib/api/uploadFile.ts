import httpClient from './httpClient';

const postFile = async (file: File, url: string): Promise<string> => {
  const form = new FormData();
  form.append('file', file);
  // Post straight through httpClient so axios sets the multipart boundary;
  // apiFetch would force application/json.
  const res = await httpClient.post<{ key: string }>(url, form, {
    headers: { Accept: 'application/json' },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 300000,
  });

  return res.data.key;
};

/** Upload one document image to the tmp bucket through the API; returns the S3 key. */
export const uploadFile = (file: File) => postFile(file, '/api/files/upload');

/** Upload one non-document asset (e.g. logo) to the public static bucket; returns the S3 key. */
export const uploadStaticFile = (file: File) => postFile(file, '/api/files/upload?type=static');
