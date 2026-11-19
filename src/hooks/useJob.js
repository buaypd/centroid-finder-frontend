import { useEffect, useState } from 'react';
import { getJobStatus } from '../api.js';

const POLL_MS = 1000;
// A job keeps running on the server even if one status check fails (a
// restart, a dropped connection), so only give up after this many failed
// checks in a row.
const MAX_FAILURES = 3;

// Polls GET /process/:jobId/status until the job is done or failed.
// Returns { status, result, error, notFound }.
export default function useJob(jobId) {
  const [state, setState] = useState({ status: jobId ? 'processing' : 'idle' });

  useEffect(() => {
    if (!jobId) {
      setState({ status: 'idle' });
      return undefined;
    }

    let cancelled = false;
    let timer;
    let failures = 0;
    setState({ status: 'processing' });

    async function poll() {
      try {
        const body = await getJobStatus(jobId);
        if (cancelled) return;
        failures = 0;
        setState(body);
        if (body.status === 'processing') timer = setTimeout(poll, POLL_MS);
      } catch (err) {
        if (cancelled) return;
        const notFound = /not found/i.test(err.message);
        failures += 1;
        // An unknown job will never appear, so stop at once. Anything else
        // might be temporary: keep the "processing" state and try again.
        if (notFound || failures >= MAX_FAILURES) {
          setState({ status: 'error', error: err.message, notFound });
        } else {
          timer = setTimeout(poll, POLL_MS);
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId]);

  return state;
}
