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
import type * as auth from "../auth.js";
import type * as highlightTips from "../highlightTips.js";
import type * as highlights from "../highlights.js";
import type * as http from "../http.js";
import type * as lib_highlightHash from "../lib/highlightHash.js";
import type * as migrations_01_auditHighlights from "../migrations/01_auditHighlights.js";
import type * as migrations_02_backfillHighlightIds from "../migrations/02_backfillHighlightIds.js";
import type * as migrations_03_validateMigration from "../migrations/03_validateMigration.js";
import type * as migrations_checkHighlights from "../migrations/checkHighlights.js";
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
  auth: typeof auth;
  highlightTips: typeof highlightTips;
  highlights: typeof highlights;
  http: typeof http;
  "lib/highlightHash": typeof lib_highlightHash;
  "migrations/01_auditHighlights": typeof migrations_01_auditHighlights;
  "migrations/02_backfillHighlightIds": typeof migrations_02_backfillHighlightIds;
  "migrations/03_validateMigration": typeof migrations_03_validateMigration;
  "migrations/checkHighlights": typeof migrations_checkHighlights;
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
