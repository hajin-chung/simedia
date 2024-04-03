import { isMobile } from "react-device-detect"
import { useRef, useState, MouseEvent, useEffect, TouchEventHandler } from "react";
import { LuPlay, LuPause, LuFastForward, LuScan, LuGalleryVerticalEnd } from "react-icons/lu";
import ReactPlayer from "react-player";
import { Button } from "./ui/button";
import { Pathname } from "./Pathname";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getNextVideo, pathJoin } from "@/lib/utils";
import { Dir } from "./Dir";
import { GoMute, GoUnmute } from "react-icons/go";
import { useEntries } from "@/hooks/useEntry";

type VideoProps = {
  path: string;
}

function leftPad(str: string, length: number, spacer: string) {
  if (str.length >= length) return str;
  let result = str;
  for (let i = 0; i < length - str.length; i++) {
    result = spacer + result;
  }
  return result
}

function formatSecond(second: number) {
  const h = Math.floor(second / (60 * 60));
  const m = Math.floor(second / 60);
  const s = Math.floor(second) % 60;
  if (h !== 0) {
    return `${leftPad(h.toString(), 2, "0")}:${leftPad(m.toString(), 2, "0")}:${leftPad(s.toString(), 2, "0")}`
  } else {
    return `${leftPad(m.toString(), 2, "0")}:${leftPad(s.toString(), 2, "0")}`
  }
}

export function Video({ path }: VideoProps) {
  const parentPath = pathJoin(path, "../")
  const [videoPath, setVideoPath] = useState(path);
  const [playbackRate, setPlaybackRate] = useState("1.0");
  const [isMuted, setMuted] = useState(false);
  const { entries } = useEntries(parentPath);

  useEffect(() => {
    const str = localStorage.getItem("playerSettings");
    if (str === null) {
      return;
    }
    const settings = JSON.parse(str);
    if (typeof settings.isMuted === "boolean") setMuted(settings.isMuted);
    if (typeof settings.playbackRate === "string")
      setPlaybackRate(settings.playbackRate);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "playerSettings",
      JSON.stringify({ isMuted, playbackRate })
    );
  }, [isMuted, playbackRate]);


  function handleEnded() {
    const nextVideoPath = getNextVideo(videoPath, entries)
    if (nextVideoPath !== null) setVideoPath(nextVideoPath)
  }

  return (
    <Player
      videoPath={videoPath}
      playbackRate={playbackRate}
      isMuted={isMuted}
      setPlaybackRate={setPlaybackRate}
      setMuted={setMuted}
      handleEnded={handleEnded}
    />
  )
}

type PlayerProps = {
  videoPath: string;
  playbackRate: string;
  isMuted: boolean;
  setPlaybackRate: (s: string) => void;
  setMuted: (s: boolean) => void;
  handleEnded: () => void;
}

function Player({ videoPath, playbackRate, isMuted, setPlaybackRate, setMuted, handleEnded }: PlayerProps) {
  const inactivityTimer = useRef<NodeJS.Timeout | undefined>();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isPlaybackRateOpen, setPlaybackRateOpen] = useState(false);

  const [playing, setPlaying] = useState(true);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [loaded, setLoaded] = useState(0);

  const playerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  function handleClick(e: MouseEvent<HTMLElement>) {
    if (isMobile) return;

    console.log("clicked!!")
    e.stopPropagation();
    setPlaying(p => !p);
  }

  const handleTouch: TouchEventHandler<HTMLElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();

    console.log("touched!!")
    console.log(controlsVisible);
    if (controlsVisible) hideControls();
    else showControls(true);
  }

  function handleSeek(e: MouseEvent<HTMLDivElement>) {
    if (!playerRef.current) return
    const fraction = (e.clientX - 20) / e.currentTarget.clientWidth
    playerRef.current.seekTo(
      fraction, "fraction"
    )
    setPlayed(fraction);
  }

  function fullscreen() {
    if (playerContainerRef.current === null) return
    if (!document.fullscreenElement) {
      document.body.requestFullscreen();
      (screen.orientation as any)['lock']("landscape");
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  function showControls(persist?: boolean) {
    setControlsVisible(true);

    clearTimeout(inactivityTimer.current);

    if (!persist) {
      inactivityTimer.current = setTimeout(() => {
        console.log("timer!")
        setControlsVisible(false);
      }, 1000);
    }
  }

  function hideControls() {
    console.log("hideControls()")
    setControlsVisible(false);
  }

  function skip(seconds: number) {
    if (played + seconds / totalSeconds >= 1) {
      handleEnded()
    } else {
      playerRef.current?.seekTo(played + seconds / totalSeconds)
    }
  }

  return (
    <div
      className="w-screen h-screen relative"
      onMouseEnter={() => showControls()}
      onMouseLeave={hideControls}
      onMouseMove={() => showControls()}
      ref={playerContainerRef}
    >
      <div
        onMouseEnter={() => showControls(true)}
        onMouseLeave={() => hideControls}
        className={`
          absolute left-1 rounded-lg bg-neutral-900 bg-opacity-50 p-2 z-10 transition-all 
          ${controlsVisible ? "top-1" : "-translate-y-full"}
        `}
      >
        <Pathname pathname={videoPath} />
      </div>
      <div
        className="w-full h-full"
        onClick={handleClick}
        onTouchEnd={handleTouch}
      >
        <ReactPlayer
          muted={isMuted}
          url={`${import.meta.env.VITE_API_URL}/data${videoPath}`}
          width="100%"
          height="100%"
          playing={playing}
          ref={playerRef}
          progressInterval={500}
          onDuration={(duration) => setTotalSeconds(duration)}
          onProgress={({ played, playedSeconds, loaded }) => {
            setPlayed(played);
            setLoaded(loaded);
            setPlayedSeconds(playedSeconds);
          }}
          playbackRate={parseFloat(playbackRate)}
          onEnded={handleEnded}
        />
      </div>
      {(controlsVisible || isSheetOpen || isPlaybackRateOpen) && (
        <div
          className="absolute w-full bottom-0 py-2 px-5"
          onMouseEnter={() => showControls(true)}
          onMouseLeave={() => hideControls()}
        >
          <div className="w-full h-2 relative group">
            <div className="w-full h-1 group-hover:h-2 transition-all absolute top-0 group-hover:-top-0.5">
              <div
                className="w-full h-full bg-neutral-100 opacity-50"
              />
              <div
                className="h-full bg-violet-50 top-0 left-0 absolute"
                style={{ width: `${loaded * 100}%` }}
              />
              <div
                className="h-full bg-violet-500 top-0 left-0 absolute"
                style={{ width: `${played * 100}%` }}
              />
              <div
                className="h-full bg-opacity-0 w-full absolute top-0 left-0 hover:cursor-pointer"
                onClick={handleSeek}
              />
            </div>
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-2 ">
              <Button
                variant="ghost"
                className="p-1.5 hover:bg-neutral-900"
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <LuPause size="24" /> : <LuPlay size="24" />}
              </Button>
              <Button
                variant="ghost"
                className="p-1.5 hover:bg-neutral-900"
                onClick={() => setMuted(!isMuted)}
              >
                {isMuted ? <GoMute size="24" /> : <GoUnmute size="24" />}
              </Button>
              <div className="flex gap-1 items-center">
                <p>{formatSecond(playedSeconds)}</p>
                <p>/</p>
                <p>{formatSecond(totalSeconds)}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center justify-center">
              <Button variant="ghost" className="p-1.5 text-lg" onClick={() => skip(-85)}>
                - 85
              </Button>
              <Button variant="ghost" className="p-1.5 text-lg" onClick={() => skip(-10)}>
                - 10
              </Button>
              <Button variant="ghost" className="p-1.5 text-lg" onClick={() => skip(10)}>
                + 10
              </Button>
              <Button variant="ghost" className="p-1.5 text-lg" onClick={() => skip(85)}>
                + 85
              </Button>
            </div>
            <div className="flex">
              <Sheet onOpenChange={(open) => setSheetOpen(open)}>
                <SheetTrigger>
                  <Button
                    variant="ghost"
                    className="p-1.5 hover:bg-neutral-900"
                  >
                    <LuGalleryVerticalEnd size="24" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-1/3">
                  <div className="h-4" />
                  <Dir path={pathJoin(videoPath, "../")} />
                </SheetContent>
              </Sheet>
              <DropdownMenu onOpenChange={(open) => setPlaybackRateOpen(open)}>
                <DropdownMenuTrigger>
                  <Button
                    variant="ghost"
                    className="p-1.5 hover:bg-neutral-900"
                  >
                    <LuFastForward size="24" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {["2.0", "1.5", "1.25", "1.0", "0.5"].map((playbackRate) => (
                    <DropdownMenuItem
                      onClick={() => setPlaybackRate(playbackRate)}
                    >
                      {playbackRate}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                className="p-1.5 hover:bg-neutral-900"
                onClick={fullscreen}
              >
                <LuScan size="24" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
