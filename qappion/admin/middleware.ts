// import { NextResponse } from "next/server";
// export function middleware(req: Request) {
//   const url = new URL(req.url);
//   if (url.pathname.startsWith("/api/admin")) {
//     const token = req.headers.get("x-admin-secret");
//     if (token !== process.env.ADMIN_SECRET) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }
//   }
//   return NextResponse.next();
// }
