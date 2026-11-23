import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchResultCsv, startJob, videoUrl } from "../api.js";
import useJob from "../hooks/useJob.js";
import {
  colorDistance,
  detect,
  hexToRgb,
  rgbToHex,
  sampleColor,
} from "../lib/detection.js";
import { drawCrosshair, drawTrack, paintMask } from "../lib/draw.js";
import { clearSavedJob, loadSavedJob, saveJob } from "../lib/savedJobs.js";
import { parseTrackCsv, summarize } from "../lib/track.js";
import HoverTip from "./HoverTip.jsx";
import PreviewPair from "./PreviewPair.jsx";
import PreviewSection from "./PreviewSection.jsx";
import ProcessSection from "./ProcessSection.jsx";
import TargetColorSection from "./TargetColorSection.jsx";
import ThresholdSection from "./ThresholdSection.jsx";
import TrackChart from "./TrackChart.jsx";
import Transport from "./Transport.jsx";

const FRAME_STEP = 1 / 30;
const STATS_INTERVAL_MS = 120;

export default function Workspace({ filename }) {
  const saved = useMemo(() => loadSavedJob(filename), [filename]);

  // Detection settings
  const [targetColor, setTargetColor] = useState(
    saved?.targetColor ?? "ff0000",
  );
  const [threshold, setThreshold] = useState(saved?.threshold ?? 60);

  // Tools and display
  const [eyedropper, setEyedropper] = useState(!saved);
  const [view, setView] = useState("overlay");
  const [showPreview, setShowPreview] = useState(true);
  const [showTrack, setShowTrack] = useState(true);

  // Video
  const [videoInfo, setVideoInfo] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [stats, setStats] = useState(null);
  const [hover, setHover] = useState(null);

  // Job + results
  const [jobRun, setJobRun] = useState(saved);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);
  const job = useJob(jobRun?.jobId ?? null);
  const [track, setTrack] = useState(null);
  const [trackError, setTrackError] = useState(null);

  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const frameCanvasRef = useRef(null);
  const frameRef = useRef(null);
  const maskImageRef = useRef(null);
  const lastStatsRef = useRef(0);
  const settingsRef = useRef(null);

  settingsRef.current = {
    target: hexToRgb(targetColor),
    threshold,
    view,
    showPreview,
    showTrack,
    track,
  };

  // ---- Frame rendering -------------------------------------------------

  const render = useCallback((forceStats = false) => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay || !video.videoWidth) return;

    const w = video.videoWidth;
    const h = video.videoHeight;

    // Grab the current frame's pixels from an offscreen canvas.
    if (!frameCanvasRef.current)
      frameCanvasRef.current = document.createElement("canvas");
    const fc = frameCanvasRef.current;
    if (fc.width !== w || fc.height !== h) {
      fc.width = w;
      fc.height = h;
    }
    const fctx = fc.getContext("2d", { willReadFrequently: true });
    fctx.drawImage(video, 0, 0, w, h);
    const frame = fctx.getImageData(0, 0, w, h);
    frameRef.current = frame;

    if (overlay.width !== w || overlay.height !== h) {
      overlay.width = w;
      overlay.height = h;
    }
    const ctx = overlay.getContext("2d");
    ctx.clearRect(0, 0, w, h);

    const s = settingsRef.current;
    const scale = Math.max(w, h) / 900;
    let result = null;

    if (s.showPreview || s.view !== "original") {
      result = detect(frame.data, w, h, s.target, s.threshold);

      if (s.view !== "original") {
        let img = maskImageRef.current;
        if (!img || img.width !== w || img.height !== h) {
          img = new ImageData(w, h);
          maskImageRef.current = img;
        }
        paintMask(img, result.mask, s.view);
        ctx.putImageData(img, 0, 0);
      }
    }

    if (s.showTrack && s.track)
      drawTrack(ctx, s.track, video.currentTime, scale);
    if (s.showPreview && result) drawCrosshair(ctx, result.centroid, scale);

    setCurrentTime(video.currentTime);

    const now = performance.now();
    if (
      result &&
      (forceStats || now - lastStatsRef.current > STATS_INTERVAL_MS)
    ) {
      lastStatsRef.current = now;
      setStats({
        matchedFraction: result.matchedFraction,
        groups: result.groups.length,
        largest: result.groups[0]?.size ?? 0,
        centroid: result.centroid,
        framePixels: w * h,
      });
    } else if (!result) {
      setStats(null);
    }
  }, []);

  // Redraw whenever a setting changes (works while paused, too).
  useEffect(() => {
    render(true);
  }, [targetColor, threshold, view, showPreview, showTrack, track, render]);

  // Video events + a per-frame loop while playing.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const useVideoFrames =
      "requestVideoFrameCallback" in HTMLVideoElement.prototype;
    let handle = null;
    let stopped = false;

    const cancel = () => {
      if (handle === null) return;
      if (useVideoFrames) video.cancelVideoFrameCallback(handle);
      else cancelAnimationFrame(handle);
      handle = null;
    };
    const tick = () => {
      handle = null;
      if (stopped) return;
      render();
      if (!video.paused && !video.ended) schedule();
    };
    const schedule = () => {
      if (handle !== null) return;
      handle = useVideoFrames
        ? video.requestVideoFrameCallback(tick)
        : requestAnimationFrame(tick);
    };

    const onPlay = () => {
      setPlaying(true);
      schedule();
    };
    const onPause = () => {
      setPlaying(false);
      cancel();
      render(true);
    };
    const onSeeked = () => render(true);
    const onLoaded = () => {
      setVideoInfo({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      });
      render(true);
    };
    const onError = () =>
      setVideoError(
        "This browser could not play the video. The processor can still run on it.",
      );

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onPause);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("error", onError);
    if (video.readyState >= 2) onLoaded();

    return () => {
      stopped = true;
      cancel();
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onPause);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("error", onError);
    };
  }, [render]);

  // ---- Job lifecycle ---------------------------------------------------

  useEffect(() => {
    if (job.status !== "done" || !job.result) return undefined;
    let cancelled = false;
    setTrackError(null);
    fetchResultCsv(job.result)
      .then((text) => !cancelled && setTrack(parseTrackCsv(text)))
      .catch((err) => !cancelled && setTrackError(err.message));
    return () => {
      cancelled = true;
    };
  }, [job.status, job.result]);

  // A remembered job the server no longer knows about (e.g. jobs.db was
  // deleted) is just forgotten.
  useEffect(() => {
    if (job.notFound) {
      clearSavedJob(filename);
      setJobRun(null);
    }
  }, [job.notFound, filename]);

  async function runDetection() {
    setStarting(true);
    setStartError(null);
    try {
      const jobId = await startJob(filename, targetColor, threshold);
      const run = { jobId, targetColor, threshold, startedAt: Date.now() };
      saveJob(filename, run);
      setTrack(null);
      setTrackError(null);
      setJobRun(run);
    } catch (err) {
      setStartError(err.message);
    } finally {
      setStarting(false);
    }
  }

  function toggleEyedropper() {
    setEyedropper((v) => !v);
  }

  function restoreRunSettings() {
    setTargetColor(jobRun.targetColor);
    setThreshold(Number(jobRun.threshold));
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) video.play();
    else video.pause();
  }

  function seek(t) {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(Math.max(0, t), video.duration);
  }

  function step(direction) {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    seek(video.currentTime + direction * FRAME_STEP);
  }

  function pointerToPixel(e) {
    const overlay = overlayRef.current;
    const frame = frameRef.current;
    if (!overlay || !frame) return null;
    const rect = overlay.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    return {
      x: Math.min(frame.width - 1, Math.max(0, Math.floor(fx * frame.width))),
      y: Math.min(frame.height - 1, Math.max(0, Math.floor(fy * frame.height))),
      left: fx * 100,
      top: fy * 100,
      frame,
    };
  }

  function handlePointerMove(e) {
    const p = pointerToPixel(e);
    if (!p) return;
    const color = sampleColor(
      p.frame.data,
      p.frame.width,
      p.frame.height,
      p.x,
      p.y,
      0,
    );
    setHover({
      x: p.x,
      y: p.y,
      left: p.left,
      top: p.top,
      hex: rgbToHex(color),
      distance: colorDistance(color, settingsRef.current.target),
    });
  }

  function handleStageClick(e) {
    if (!eyedropper) {
      togglePlay();
      return;
    }
    const p = pointerToPixel(e);
    if (!p) return;
    const color = sampleColor(
      p.frame.data,
      p.frame.width,
      p.frame.height,
      p.x,
      p.y,
      2,
    );
    setTargetColor(rgbToHex(color));
  }

  // Keyboard shortcuts: space = play/pause, arrows = step, E = eyedropper.
  useEffect(() => {
    function onKey(e) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key.toLowerCase() === "e") {
        setEyedropper((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ---- Derived values --------------------------------------------------

  const settingsChanged =
    jobRun &&
    (jobRun.targetColor !== targetColor ||
      Number(jobRun.threshold) !== Number(threshold));
  const summary = track ? summarize(track) : null;
  const duration = videoInfo?.duration ?? 0;

  return (
    <div className="workspace">
      <section className="stage-col">
        <PreviewPair
          filename={filename}
          targetColor={targetColor}
          threshold={threshold}
        />
        <div
          className="stage"
          style={
            videoInfo
              ? { aspectRatio: `${videoInfo.width} / ${videoInfo.height}` }
              : undefined
          }
        >
          <video
            ref={videoRef}
            src={videoUrl(filename)}
            preload="auto"
            muted
            playsInline
          />
          <canvas
            ref={overlayRef}
            className={`overlay ${eyedropper ? "picking" : ""}`}
            onClick={handleStageClick}
            onMouseMove={handlePointerMove}
            onMouseLeave={() => setHover(null)}
          />
          {hover && (
            <HoverTip
              hover={hover}
              threshold={threshold}
              eyedropper={eyedropper}
            />
          )}
          {!videoInfo && !videoError && (
            <div className="stage-message">Loading video…</div>
          )}
          {videoError && (
            <div className="stage-message error">{videoError}</div>
          )}
        </div>

        <Transport
          playing={playing}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={togglePlay}
          onStep={step}
          onSeek={seek}
        />

        {track && (
          <TrackChart
            rows={track}
            frameWidth={videoInfo?.width}
            frameHeight={videoInfo?.height}
            duration={duration}
            currentTime={currentTime}
            onSeek={seek}
          />
        )}
      </section>

      <aside className="panel">
        <TargetColorSection
          targetColor={targetColor}
          onColorChange={setTargetColor}
          eyedropper={eyedropper}
          onToggleEyedropper={toggleEyedropper}
        />

        <ThresholdSection threshold={threshold} onChange={setThreshold} />

        <PreviewSection
          view={view}
          onViewChange={setView}
          showPreview={showPreview}
          onShowPreviewChange={setShowPreview}
          showTrack={showTrack}
          onShowTrackChange={setShowTrack}
          hasTrack={Boolean(track)}
          stats={stats}
        />

        <ProcessSection
          job={job}
          jobRun={jobRun}
          starting={starting}
          startError={startError}
          targetColor={targetColor}
          threshold={threshold}
          summary={summary}
          trackError={trackError}
          settingsChanged={settingsChanged}
          onRun={runDetection}
          onRestore={restoreRunSettings}
        />

        <p className="muted small shortcuts">
          <kbd>Space</kbd> play/pause · <kbd>←</kbd>/<kbd>→</kbd> step frame ·{" "}
          <kbd>E</kbd> eyedropper
        </p>
      </aside>
    </div>
  );
}
