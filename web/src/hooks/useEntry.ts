import { useEffect } from "react";
import { useState } from "react";

export type EntryType = "dir" | "video" | "image" | "text";

export type EntryInfo = {
  type: EntryType;
  name: string;
};

export type DirInfo = {
  entries: EntryInfo[]
}

export function useEntry(path: string) {
  const [isLoading, setLoading] = useState(true);
  const [entryInfo, setInfo] = useState<EntryInfo | null>(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        console.log(import.meta.env)
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/entry?path=${path}`)
        const data = await res.json() as EntryInfo;
        setInfo(data);
      } catch (e) {
        console.error(e)
      }
      setLoading(false);
    })()
  }, [path]);

  return { entryInfo, isLoading }
}

export function useEntries(path: string) {
  const [isLoading, setLoading] = useState(true);
  const [entries, setEntries] = useState<EntryInfo[]>([]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dir?path=${path}`)
        const data = await res.json() as { entries: EntryInfo[] };
        setEntries(data.entries.sort());
      } catch (e) {
        console.error(e)
      }
      setLoading(false);
    })()
  }, [path]);

  return { entries, isLoading }
}
