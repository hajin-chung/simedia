import { useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout"
import { Pathname } from "@/components/Pathname";
import { useEntry } from "@/hooks/useEntry";
import { Skeleton } from "@/components/ui/skeleton";
import { Dir } from "@/components/Dir";
import { Video } from "@/components/Video";

export function Main() {
  const { pathname } = useLocation();
  const { entryInfo, isLoading } = useEntry(pathname);

  if (isLoading) {
    return (
      <Layout>
        <Skeleton className="w-[100px] h-5 rounded-md" />
      </Layout>
    )
  }

  if (entryInfo === null) {
    return (
      "error!"
    )
  }

  if (entryInfo.type === "dir") {
    return (
      <Layout>
        <Pathname />
        <div className="h-5" />
        <Dir path={pathname} />
      </Layout>
    )
  } if (entryInfo.type === "video") {
    return (
      <Video path={pathname} />
    )
  } else {
    return (
      "hi"
    )
  }
}
