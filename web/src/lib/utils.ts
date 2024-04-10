import { EntryInfo } from "@/hooks/useEntry"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pathJoin(...segments: string[]) {
  const parts = segments.reduce((parts: string[], segment) => {
    // Remove leading slashes from non-first part.
    if (parts.length > 0) {
      segment = segment.replace(/^\//, '')
    }
    // Remove trailing slashes.
    segment = segment.replace(/\/$/, '')
    return parts.concat(segment.split('/'))
  }, [])
  const resultParts: string[] = []
  for (const part of parts) {
    if (part === '.') {
      continue
    }
    if (part === '..') {
      resultParts.pop()
      continue
    }
    resultParts.push(part)
  }
  return resultParts.join('/')
}

export function getNextVideo(currentPath: string, entries: EntryInfo[]) {
  let foundCurrentPath = false;
  for (let i = 0; i < entries.length; i++) {
    const entryPath = decodeURI(pathJoin(currentPath, "../", entries[i].name))
    if (foundCurrentPath && entries[i].type === "video") {
      return entryPath;
    }

    if (entryPath === decodeURI(currentPath)) foundCurrentPath = true;
  }
  return null
}

export function leftPad(str: string, length: number, spacer: string) {
  if (str.length >= length) return str;
  let result = str;
  for (let i = 0; i < length - str.length; i++) {
    result = spacer + result;
  }
  return result
}

export function formatSecond(second: number) {
  const h = Math.floor(second / (60 * 60));
  const m = Math.floor(second / 60);
  const s = Math.floor(second) % 60;
  if (h !== 0) {
    return `${leftPad(h.toString(), 2, "0")}:${leftPad(m.toString(), 2, "0")}:${leftPad(s.toString(), 2, "0")}`
  } else {
    return `${leftPad(m.toString(), 2, "0")}:${leftPad(s.toString(), 2, "0")}`
  }
}
