import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Add auth routes
auth.addHttpRoutes(http);

// You can add custom HTTP routes here if needed
// http.route({
//   path: "/api/custom",
//   method: "GET",
//   handler: async (ctx, request) => {
//     return new Response("Custom endpoint", { status: 200 });
//   },
// });

export default http;