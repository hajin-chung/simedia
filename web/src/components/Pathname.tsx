import { Fragment } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Link, useLocation } from "react-router-dom";
import { FiHome } from "react-icons/fi";

export function Pathname() {
  const { pathname } = useLocation();
  const paths = pathname
    .split("/")
    .filter(path => path.length !== 0)
    .map(decodeURI);
  const generateHref = (index: number) => {
    return paths.slice(0, index + 1).join("/")
  }

  return (
    <Breadcrumb className="h-5 w-full flex items-center">
      <BreadcrumbList>
        <Fragment key="home">
          {paths.length === 0 ? (
            <BreadcrumbPage>
              <FiHome size="20" />
            </BreadcrumbPage>
          ) : (
            <>
              <BreadcrumbLink asChild>
                <Link to="/">
                  <FiHome size="20" />
                </Link>
              </BreadcrumbLink>
              <BreadcrumbSeparator />
            </>
          )}
        </Fragment>
        {
          paths.map((path, i) => {
            const isLastItem = i + 1 === paths.length || paths.length === 1;
            const href = generateHref(i);

            return (
              <Fragment key={generateHref(i)}>
                <BreadcrumbItem key={i}>
                  {isLastItem ? (
                    <BreadcrumbPage className="text-lg font-bold">
                      {path}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={href} className="text-lg">
                        {path}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLastItem && <BreadcrumbSeparator />}
              </Fragment>
            );
          })
        }
      </BreadcrumbList>
    </Breadcrumb>
  )
}
