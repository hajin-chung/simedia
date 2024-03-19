import React from "react";
import { EntryType, useEntries } from "@/hooks/useEntry";
import { FiFolder, FiFileText, FiVideo, FiImage } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";
import { pathJoin } from "@/lib/utils";

const EntryIcons: Record<EntryType, React.ReactNode> = {
  dir: <FiFolder size="16" />,
  text: <FiFileText size="16" />,
  video: <FiVideo size="16" />,
  image: <FiImage size="16" />,
};

type DirProps = {
  path: string;
}

export function Dir({ path }: DirProps) {
  const { entries, isLoading } = useEntries(path);
  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <Skeleton className="h-6 w-2/3 rounded-md" />
        <Skeleton className="h-6 w-2/3 rounded-md" />
        <Skeleton className="h-6 w-2/3 rounded-md" />
        <Skeleton className="h-6 w-2/3 rounded-md" />
      </div>
    )
  }
  return (
    <div className="w-full flex flex-col gap-1.5">
      {entries.map(({ name, type }) => (
        <Link
          to={pathJoin(window.location.pathname, name)}
          relative="path"
          className="items-start w-full rounded-md flex p-1 hover:bg-neutral-800 transition-all"
        >
          <div className="w-4 h-4 pt-1">
            {EntryIcons[type]}
          </div>
          <div className="w-2" />
          <p className="w-full break-all">{name}</p>
        </Link>
      ))
      }
    </div >
  )
}
