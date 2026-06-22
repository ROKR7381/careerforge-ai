import { describe, it, expect, beforeEach, vi } from "vitest";
import { cache, buildCacheKey, sha256 } from "../cache";

describe("cache — get/set", () => {
  beforeEach(() => {
    cache._clearAll();
  });

  it("returns null on miss", () => {
    expect(cache.get("nope")).toBeNull();
  });

  it("round-trips a value", () => {
    cache.set("k", { foo: "bar" });
    expect(cache.get("k")).toEqual({ foo: "bar" });
  });

  it("expires values after TTL", async () => {
    vi.useFakeTimers();
    cache.set("k", "v", 1000); // 1s TTL
    expect(cache.get("k")).toBe("v");
    vi.advanceTimersByTime(1001);
    expect(cache.get("k")).toBeNull();
    vi.useRealTimers();
  });

  it("different keys don't collide", () => {
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.get("a")).toBe(1);
    expect(cache.get("b")).toBe(2);
  });
});

describe("cache — invalidatePrefix", () => {
  beforeEach(() => {
    cache._clearAll();
  });

  it("removes all keys matching the prefix", () => {
    cache.set("jobs:user1:abc", 1);
    cache.set("jobs:user1:def", 2);
    cache.set("jobs:user2:abc", 3);
    cache.set("other:user1:xyz", 4);
    const removed = cache.invalidatePrefix("jobs:user1:");
    expect(removed).toBe(2);
    expect(cache.get("jobs:user1:abc")).toBeNull();
    expect(cache.get("jobs:user1:def")).toBeNull();
    expect(cache.get("jobs:user2:abc")).toBe(3);
    expect(cache.get("other:user1:xyz")).toBe(4);
  });

  it("returns 0 when no keys match", () => {
    cache.set("foo", 1);
    expect(cache.invalidatePrefix("bar:")).toBe(0);
    expect(cache.get("foo")).toBe(1);
  });
});

describe("cache — buildCacheKey", () => {
  it("builds a deterministic user-scoped key", () => {
    expect(buildCacheKey("u1", "h1")).toBe("jobs:u1:h1");
    expect(buildCacheKey("user-abc", "hash-xyz")).toBe("jobs:user-abc:hash-xyz");
  });
});

describe("cache — sha256", () => {
  it("produces a 64-char hex digest", async () => {
    const hash = await sha256("hello world");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is deterministic", async () => {
    const a = await sha256("abc");
    const b = await sha256("abc");
    expect(a).toBe(b);
  });

  it("different inputs produce different digests", async () => {
    expect(await sha256("a")).not.toBe(await sha256("b"));
  });

  it("matches known SHA-256 of 'hello'", async () => {
    // sha256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    const hash = await sha256("hello");
    expect(hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });
});
