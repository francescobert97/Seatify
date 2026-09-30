import { useState, useEffect } from "react";

export function navigate(path: string): void {
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}

export interface RouteInfo {
  path: string;
  eventId: string | null;
}

export function parseRoute(pathname: string): RouteInfo {
  // Support both /events/:id and /events/:id/
  const match = pathname.match(/^\/events\/([a-zA-Z0-9_-]+)/);
  return {
    path: pathname,
    eventId: match ? match[1] : null,
  };
}

export function useCurrentRoute(): RouteInfo {
  const [route, setRoute] = useState<RouteInfo>(() =>
    parseRoute(window.location.pathname)
  );

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return route;
}

