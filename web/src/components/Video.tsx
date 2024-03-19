import { useRef, useState, MouseEvent, useEffect } from "react";
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
import { pathJoin } from "@/lib/utils";
import { Dir } from "./Dir";
import { GoMute, GoUnmute } from "react-icons/go";

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
  const [isHover, setHover] = useState(false);
  const [isControlsHover, setControlsHover] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [isRateOpen, setRateOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState("1.0");
  const [isMuted, setMuted] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isControlsHover) {
      setShowControls(true);
      return;
    }

    if (isRateOpen) {
      setShowControls(true);
      return;
    }

    setShowControls(isHover);
    const timeout = setTimeout(() => {
      setHover(false);
      setShowControls(false);
    }, 1000);
    return () => clearInterval(timeout);
  }, [isHover, isControlsHover, isRateOpen]);

  function handleClick(e: MouseEvent<HTMLElement>) {
    e.stopPropagation();
    setPlaying(p => !p);
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
      screen.orientation.lock("landscape-primary");
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  return (
    <div
      className="w-screen h-screen relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={() => setHover(true)}
      ref={playerContainerRef}
    >
      {showControls && (
        <div
          onMouseEnter={() => setControlsHover(true)}
          onMouseLeave={() => setControlsHover(false)}
          className="absolute top-1 left-1 rounded-lg bg-neutral-900 bg-opacity-50 p-2 z-10"
        >
          <Pathname />
        </div>
      )}
      <ReactPlayer
        muted={isMuted}
        url={`${import.meta.env.VITE_API_URL}/data${path}`}
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
        onClick={handleClick}
      />
      {showControls && (
        <div
          className="absolute w-full bottom-0 py-2 px-5"
          onMouseEnter={() => setControlsHover(true)}
          onMouseLeave={() => setControlsHover(false)}
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
              <Button variant="ghost" className="p-1.5 hover:bg-neutral-900" onClick={handleClick}>
                {playing ? <LuPause size="24" /> : <LuPlay size="24" />}
              </Button>
              <Button
                variant="ghost"
                className="p-1.5 hover:bg-neutral-900"
                onClick={() => setMuted((m) => !m)}
              >
                {isMuted ? <GoMute size="24" /> : <GoUnmute size="24" />}
              </Button>
              <div className="flex gap-1 items-center">
                <p>{formatSecond(playedSeconds)}</p>
                <p>/</p>
                <p>{formatSecond(totalSeconds)}</p>
              </div>
            </div>
            <div className="flex">
              <Sheet onOpenChange={(open) => open && setControlsHover(true)}>
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
                  <Dir path={pathJoin(path, "../")} />
                </SheetContent>
              </Sheet>
              <DropdownMenu onOpenChange={(open) => setRateOpen(open)}>
                <DropdownMenuTrigger
                  onMouseEnter={() => setControlsHover(true)}
                  onMouseLeave={() => setControlsHover(false)}
                >
                  <Button
                    variant="ghost"
                    className="p-1.5 hover:bg-neutral-900"
                  >
                    <LuFastForward size="24" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                >
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
