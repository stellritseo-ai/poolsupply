import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ServerCrash, Loader2 } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/components/site/cart-context";
import { CartDrawer } from "@/components/site/CartDrawer";
import { getGlobalSettings } from "@/lib/api/settings.functions";
import { Toaster } from "@/components/ui/sonner";



function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pool Supply Wholesalers — Premium Pool Equipment at Wholesale Prices" },
      { name: "description", content: "Trusted wholesale supplier of premium pool pumps, heaters, filters, cleaners, lights and automation from Pentair, Hayward, Jandy and more." },
      { name: "author", content: "Pool Supply Wholesalers" },
      { property: "og:title", content: "Pool Supply Wholesalers — Premium Pool Equipment Wholesale" },
      { property: "og:description", content: "Pool pumps, heaters, filters, cleaners and automation systems from the industry's leading brands at wholesale pricing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkMaintenance() {
      // Never block the admin dashboard
      if (router.state.location.pathname.startsWith("/admin")) {
        setIsChecking(false);
        return;
      }
      
      try {
        const res = await getGlobalSettings();
        if (res.success && res.settings?.maintenanceMode) {
          setIsMaintenance(true);
        } else {
          setIsMaintenance(false);
        }
      } catch (e) {
        console.error(e);
      }
      setIsChecking(false);
    }
    
    checkMaintenance();
  }, [router.state.location.pathname]);

  if (isChecking && !router.state.location.pathname.startsWith("/admin")) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isMaintenance && !router.state.location.pathname.startsWith("/admin")) {
    return (
      <html lang="en">
        <HeadContent />
        <body>
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-primary/30 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 max-w-lg mx-auto backdrop-blur-xl bg-white/5 border border-white/10 p-12 rounded-[3rem] shadow-2xl">
              <div className="w-24 h-24 bg-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-[0_0_30px_rgba(2,132,199,0.3)]">
                <ServerCrash className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">System Upgrade</h1>
              <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed mb-8">
                We are currently performing scheduled maintenance on our storefront to serve you better. We'll be back online shortly.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Under Maintenance
              </div>
            </div>
          </div>
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <CartDrawer />
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}

