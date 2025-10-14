/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as articles from "../articles.js";
import type * as auth from "../auth.js";
import type * as highlightTips from "../highlightTips.js";
import type * as highlights from "../highlights.js";
import type * as http from "../http.js";
import type * as nfts from "../nfts.js";
import type * as tips from "../tips.js";
import type * as uploads from "../uploads.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  articles: typeof articles;
  auth: typeof auth;
  highlightTips: typeof highlightTips;
  highlights: typeof highlights;
  http: typeof http;
  nfts: typeof nfts;
  tips: typeof tips;
  uploads: typeof uploads;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
