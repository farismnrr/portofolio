"use client";

import NotFound from "@/app/not-found";
import { getApiUrl } from "@/lib/config/backend";
import { protectedRoutes, routes } from "@/resources";
import { useAuthStore } from "@/store/auth";
import { Button, Column, Flex, Heading, PasswordInput, Spinner } from "@once-ui-system/core";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  // Auth Store
  const isInitializing = useAuthStore((state) => state.isInitializing);

  const [isRouteEnabled, setIsRouteEnabled] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    const performChecks = async () => {
      // If store is still refreshing/initializing, keep loading
      if (isInitializing) {
        setLoading(true);
        return;
      }

      setLoading(true);
      setIsRouteEnabled(false);
      setIsPasswordRequired(false);
      setIsAuthenticated(false);
      setIsAuthorized(true);

      // 1. Check if route is enabled (404 check)
      const checkRouteEnabled = () => {
        if (!pathname) return false;

        // Check exact match in routes map
        if (pathname in routes) {
          return routes[pathname as keyof typeof routes];
        }

        // Check dynamic routes
        const dynamicRoutes = ["/blog", "/projects", "/dashboard"] as const;
        for (const route of dynamicRoutes) {
          if (pathname?.startsWith(route)) {
            // Dashboard is special - it might not be in the public 'routes' map but is valid
            if (route === "/dashboard") return true;
            if (routes[route]) return true;
          }
        }
        return false;
      };

      const routeEnabled = checkRouteEnabled();
      setIsRouteEnabled(routeEnabled);

      // Dashboard routes - trust SSO authorization
      // If SSO redirected them here, they're already authorized
      if (pathname?.startsWith("/dashboard")) {
        setIsAuthenticated(true);
      }

      // Password Check for other protected routes
      else if (protectedRoutes[pathname as keyof typeof protectedRoutes]) {
        setIsPasswordRequired(true);

        const response = await fetch(getApiUrl("/page-auth/check"));
        if (response.ok) {
          const resBody = await response.json();
          const data = resBody.data;
          setIsAuthenticated((resBody.success && data?.authenticated) || false);
        }
      }

      setLoading(false);
    };

    performChecks();
  }, [pathname, isInitializing]);

  const handlePasswordSubmit = async () => {
    const response = await fetch(getApiUrl("/page-auth/authenticate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      setIsAuthenticated(true);
      setError(undefined);
    } else {
      setError("Incorrect password");
    }
  };

  if (loading) {
    return (
      <Flex fillWidth paddingY="128" horizontal="center">
        <Spinner />
      </Flex>
    );
  }

  if (!isRouteEnabled) {
    return <NotFound />;
  }

  // RBAC Failure
  if (!isAuthorized) {
    // Redirect or show 403. For now, showing a simple forbidden message.
    // In a real app, you might route.push('/')
    return (
      <Column fillWidth paddingY="128" gap="24" horizontal="center">
        <Heading>403 - Forbidden</Heading>
        <Button
          onClick={() => {
            router.push("/");
          }}
        >
          Go Home
        </Button>
      </Column>
    );
  }

  if (isPasswordRequired && !isAuthenticated) {
    return (
      <Column paddingY="128" maxWidth={24} gap="24" center>
        <Heading align="center" wrap="balance">
          This page is password protected
        </Heading>
        <Column fillWidth gap="8" horizontal="center">
          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorMessage={error}
          />
          <Button onClick={handlePasswordSubmit}>Submit</Button>
        </Column>
      </Column>
    );
  }

  return <>{children}</>;
};

export { RouteGuard };
