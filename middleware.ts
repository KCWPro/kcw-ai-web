import { NextRequest, NextResponse } from "next/server";

function unauthorizedResponse(realm: string) {
  return new NextResponse("Internal area is restricted for controlled Beta testing.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm=\"${realm}\", charset=\"UTF-8\"`,
    },
  });
}

export function middleware(request: NextRequest) {
  const user = process.env.INTERNAL_BETA_USER;
  const pass = process.env.INTERNAL_BETA_PASS;

  if (!user || !pass) {
    return new NextResponse("Internal area is disabled until Beta gate credentials are configured.", {
      status: 403,
    });
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) {
    return unauthorizedResponse("KCW Internal Beta");
  }

  const encoded = header.slice("Basic ".length).trim();
  let decoded = "";

  try {
    decoded = atob(encoded);
  } catch {
    return unauthorizedResponse("KCW Internal Beta");
  }

  const separatorIndex = decoded.indexOf(":");
  const inputUser = separatorIndex >= 0 ? decoded.slice(0, separatorIndex) : decoded;
  const inputPass = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : "";

  if (inputUser !== user || inputPass !== pass) {
    return unauthorizedResponse("KCW Internal Beta");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/internal/:path*", "/api/internal/:path*"],
};
