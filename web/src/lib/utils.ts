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
