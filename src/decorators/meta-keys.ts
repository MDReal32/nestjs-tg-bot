/*
 * Copyright 2025 MDReal
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Metadata keys used by decorators to attach runtime information
 * (commands, middlewares, filters, scopes) to providers.
 *
 * These symbols ensure no collisions with other metadata in the app.
 */
export const META_KEYS = {
  /** Class-level middlewares (applied to all handlers in a provider). */
  CLASS_USE: Symbol("tg:class:use"),

  /** Method-level middlewares (applied to a single handler). */
  METHOD_USE: Symbol("tg:method:use"),

  /** Registered `/command` handlers. */
  COMMANDS: Symbol("tg:commands"),

  /** Registered `@Hears` triggers (string or RegExp). */
  HEARS: Symbol("tg:hears"),

  /** Registered `@On` filters (raw grammY event strings). */
  ON: Symbol("tg:on"),

  /** Registered scopes (`@Scope` / `@Scopes`) for multi-bot apps. */
  SCOPES: Symbol("tg:scopes")
} as const;
