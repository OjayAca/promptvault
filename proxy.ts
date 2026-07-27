import {createServerClient} from "@supabase/ssr";
import {NextResponse, type NextRequest} from "next/server";
import {getSupabaseConfig} from "@/lib/env";

const protectedRoutes = ["/app", "/account", "/billing", "/admin"];
const authRoutes = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const config = getSupabaseConfig();
  const {pathname} = request.nextUrl;

  if (!config) {
    return NextResponse.next();
  }

  let response = NextResponse.next({request});
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
        response = NextResponse.next({request});
        cookiesToSet.forEach(({name, value, options}) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user && protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && authRoutes.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }

  if (user && pathname.startsWith("/admin")) {
    const {data: profile} = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/app";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
