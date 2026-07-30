import React, { useEffect, useRef, useState } from 'react';

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371.mp4";

const ScrollVideo = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [framesReady, setFramesReady] = useState(false);

  const framesRef = useRef([]);
  const targetProgressRef = useRef(0);
  const smoothedProgressRef = useRef(0);
  const animFrameIdRef = useRef(null);

  // 1. Scroll Event Listener mapping scrollY to 0..1
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollHeight));
      targetProgressRef.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Frame Extraction & Render Loop
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');

    // Resize Canvas according to Device Pixel Ratio
    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Draw frame onto canvas with object-cover aspect ratio
    const drawImageObjectCover = (img) => {
      if (!img || !canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = window.innerWidth * dpr;
      const ch = window.innerHeight * dpr;

      const imgW = img.width || img.videoWidth || 1920;
      const imgH = img.height || img.videoHeight || 1080;

      const imgRatio = imgW / imgH;
      const canvasRatio = cw / ch;

      let drawW, drawH, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawW = cw;
        drawH = cw / imgRatio;
        offsetX = 0;
        offsetY = (ch - drawH) / 2;
      } else {
        drawH = ch;
        drawW = ch * imgRatio;
        offsetX = (cw - drawW) / 2;
        offsetY = 0;
      }

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    // Smooth Lerp Animation Loop
    const renderLoop = () => {
      const target = targetProgressRef.current;
      smoothedProgressRef.current += (target - smoothedProgressRef.current) * 0.12;
      const currentProgress = smoothedProgressRef.current;

      const totalFrames = framesRef.current.length;
      if (totalFrames > 0 && framesReady) {
        const frameIndex = Math.min(totalFrames - 1, Math.floor(currentProgress * totalFrames));
        const frameImg = framesRef.current[frameIndex];
        if (frameImg) {
          drawImageObjectCover(frameImg);
        }
      } else if (video && video.duration) {
        // Fallback: Seek video timeline smoothly
        const targetTime = currentProgress * (video.duration - 0.05);
        if (Math.abs(video.currentTime - targetTime) > 0.04) {
          video.currentTime = targetTime;
        }
        drawImageObjectCover(video);
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [framesReady]);

  // 3. Offscreen Frame Caching
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setVideoLoaded(true);

      // Start offscreen frame extraction after small delay
      setTimeout(async () => {
        try {
          const offscreenVideo = document.createElement('video');
          offscreenVideo.src = VIDEO_URL;
          offscreenVideo.crossOrigin = 'anonymous';
          offscreenVideo.muted = true;
          offscreenVideo.preload = 'auto';
          await offscreenVideo.load();

          const duration = offscreenVideo.duration || 5;
          const frameCount = Math.min(90, Math.floor(duration * 15));
          const extractedFrames = [];

          const offCanvas = document.createElement('canvas');
          const scale = Math.min(1, 960 / (offscreenVideo.videoWidth || 1920));
          offCanvas.width = (offscreenVideo.videoWidth || 1920) * scale;
          offCanvas.height = (offscreenVideo.videoHeight || 1080) * scale;
          const offCtx = offCanvas.getContext('2d');

          for (let i = 0; i < frameCount; i++) {
            const time = (i / (frameCount - 1)) * (duration - 0.05);
            offscreenVideo.currentTime = time;
            await new Promise((resolve) => {
              const onSeeked = () => {
                offscreenVideo.removeEventListener('seeked', onSeeked);
                offCtx.drawImage(offscreenVideo, 0, 0, offCanvas.width, offCanvas.height);
                createImageBitmap(offCanvas)
                  .then((bmp) => {
                    extractedFrames.push(bmp);
                    resolve();
                  })
                  .catch(() => resolve());
              };
              offscreenVideo.addEventListener('seeked', onSeeked);
            });
          }

          if (extractedFrames.length > 10) {
            framesRef.current = extractedFrames;
            setFramesReady(true);
          }
        } catch (e) {
          console.warn('Frame cache extraction skipped, using video seek fallback:', e);
        }
      }, 400);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    return () => video.removeEventListener('loadeddata', handleLoadedData);
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none">
      {/* Background Poster image */}
      <img
        src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371.mp4&w=1280&q=85"
        alt="Hero background"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          videoLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Video element */}
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          framesReady ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Scrubbed Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          framesReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Subtle Dark Vignette Overlay for Crisp White Typography Readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-brightness-[0.85] pointer-events-none" />
    </div>
  );
};

export default ScrollVideo;
