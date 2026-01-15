/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as articles from "../articles.js";
import type * as arweave from "../arweave.js";
import type * as arweaveHelpers from "../arweaveHelpers.js";
import type * as auth from "../auth.js";
import type * as highlightTips from "../highlightTips.js";
import type * as highlights from "../highlights.js";
import type * as http from "../http.js";
import type * as lib_highlightHash from "../lib/highlightHash.js";
import type * as nfts from "../nfts.js";
import type * as tips from "../tips.js";
import type * as uploads from "../uploads.js";
import type * as users from "../users.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  articles: typeof articles;
  arweave: typeof arweave;
  arweaveHelpers: typeof arweaveHelpers;
  auth: typeof auth;
  highlightTips: typeof highlightTips;
  highlights: typeof highlights;
  http: typeof http;
  "lib/highlightHash": typeof lib_highlightHash;
  nfts: typeof nfts;
  tips: typeof tips;
  uploads: typeof uploads;
  users: typeof users;
  waitlist: typeof waitlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
