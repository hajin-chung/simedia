import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

type OnPrgressProps = {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
};

type PlayerProps = {
  url?: string;
  width?: string | number;
  height?: string | number;
  muted?: boolean;
  playing?: boolean;
  playbackRate?: number;
  onDuration?: (duration: number) => void;
  onProgress?: (props: OnPrgressProps) => void;
  onEnded?: () => void;
};

function Player(
  {
    url,
    width,
    height,
    muted,
    playing,
    playbackRate,
    onDuration,
    onProgress,
    onEnded,
  }: PlayerProps,
  ref: ForwardedRef<HTMLVideoElement>,
) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => videoRef.current!);

  useEffect(() => {
    if (videoRef.current && playbackRate !== undefined)
      videoRef.current.playbackRate = playbackRate;
  }, [videoRef, playbackRate]);

  useEffect(() => {
    if (videoRef.current && playing !== undefined) {
      if (playing) videoRef.current.play();
      else videoRef.current.pause();
    }
  }, [videoRef, playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleDurationChange = () => onDuration?.(video.duration);
      const handleEnded = () => onEnded?.();
      video.addEventListener("durationchange", handleDurationChange);
      video.addEventListener("ended", handleEnded);
      return () => {
        video.removeEventListener("durationchange", handleDurationChange);
        video.removeEventListener("ended", handleEnded);
      };
    }
  }, [onDuration, onEnded]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && onProgress) {
      const handleTimeUpdate = () => {
        const playedSeconds = video.currentTime;
        const played = playedSeconds / video.duration;
        // Assuming loaded metadata is available for these calculations
        const loaded =
          video.buffered.length > 0
            ? video.buffered.end(video.buffered.length - 1) / video.duration
            : 0;
        const loadedSeconds = loaded * video.duration;
        onProgress({ played, playedSeconds, loaded, loadedSeconds });
      };
      video.addEventListener("timeupdate", handleTimeUpdate);
      return () => video.removeEventListener("timeupdate", handleTimeUpdate);
    }
  }, [onProgress]);

  return (
    <video
      src={url}
      controls={false}
      ref={videoRef}
      style={{width, height}}
      muted={muted}
    />
  );
}

export const ReactPlayer = forwardRef<HTMLVideoElement, PlayerProps>(Player);
