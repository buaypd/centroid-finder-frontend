// Thin wrappers around the Salamander API served by the Express server.

const enc = encodeURIComponent;

async function readError(res, fallback) {
  try {
    const body = await res.json();
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

export async function listVideos() {
  const res = await fetch('/api/videos');
  if (!res.ok) throw new Error(await readError(res, 'Could not load videos'));
  return res.json();
}

// POST /api/videos (multipart, field "video") -> filename.
// Uses XMLHttpRequest because fetch can't report upload progress.
// `onProgress` gets a number from 0 to 100; `signal` cancels the upload.
export function uploadVideo(file, onProgress, signal) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/videos');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let body = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // not JSON; use the fallback message below
      }
      if (xhr.status === 201 && body?.filename) resolve(body.filename);
      else reject(new Error(body?.error || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Could not reach the server.'));
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'));

    signal?.addEventListener('abort', () => xhr.abort());

    const form = new FormData();
    form.append('video', file);
    xhr.send(form);
  });
}

export const thumbnailUrl = (filename) => `/thumbnail/${enc(filename)}`;
export const videoUrl = (filename) => `/videos/${enc(filename)}`;

export async function startJob(filename, targetColor, threshold) {
  const query = new URLSearchParams({ targetColor, threshold: String(threshold) });
  const res = await fetch(`/process/${enc(filename)}?${query}`, { method: 'POST' });
  if (res.status !== 202) throw new Error(await readError(res, 'Could not start job'));
  const { jobId } = await res.json();
  return jobId;
}

export async function getJobStatus(jobId) {
  const res = await fetch(`/process/${enc(jobId)}/status`);
  if (!res.ok) throw new Error(await readError(res, 'Could not fetch job status'));
  return res.json();
}

// `result` is the server's path, e.g. "/results/intro.mp4.csv".
export const resultUrl = (result) => encodeURI(result);

export async function fetchResultCsv(result) {
  const res = await fetch(resultUrl(result));
  if (!res.ok) throw new Error('Could not download result CSV');
  return res.text();
}
