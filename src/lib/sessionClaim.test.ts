import { describe, expect, it, vi } from "vitest";
import { claimSessionsForUser } from "./sessionClaim";

type Doc = {
  id: string;
  ref: { id: string };
  data: () => Record<string, unknown>;
};
function doc(id: string, data: Record<string, unknown>): Doc {
  return { id, ref: { id }, data: () => data };
}

function makeDb(opts: {
  lowerDocs?: Doc[];
  legacyDocs?: Doc[];
  /** ownerUid seen inside the transaction (defaults to the candidate's). */
  txOwner?: Record<string, string | undefined>;
}) {
  const updates: Array<{ id: string; data: Record<string, unknown> }> = [];
  const candidateOwner: Record<string, string | undefined> = {};
  for (const d of [...(opts.lowerDocs ?? []), ...(opts.legacyDocs ?? [])]) {
    candidateOwner[d.id] = d.data().ownerUid as string | undefined;
  }
  const db = {
    collection: () => ({
      where: (field: string) => ({
        limit: () => ({
          get: async () => ({
            docs: field === "emailLower" ? opts.lowerDocs ?? [] : opts.legacyDocs ?? [],
          }),
        }),
      }),
    }),
    runTransaction: async (
      cb: (tx: {
        get: (ref: { id: string }) => Promise<{ data: () => Record<string, unknown> }>;
        update: (ref: { id: string }, data: Record<string, unknown>) => void;
      }) => Promise<boolean>,
    ) =>
      cb({
        get: async (ref) => ({
          data: () => ({
            ownerUid: opts.txOwner?.[ref.id] ?? candidateOwner[ref.id],
          }),
        }),
        update: (ref, data) => updates.push({ id: ref.id, data }),
      }),
  };
  return { db, updates };
}

function adminAuth(byUid: Record<string, "anon" | "permanent" | "missing">) {
  return {
    getUser: vi.fn(async (uid: string) => {
      const kind = byUid[uid];
      if (kind === "missing") throw { code: "auth/user-not-found" };
      return {
        providerData: kind === "permanent" ? [{ providerId: "password" }] : [],
      };
    }),
  };
}

const user = { uid: "verified_uid", email: "Lead@Example.com" };

describe("claimSessionsForUser (fix-07 security invariants)", () => {
  it("claims a session owned by an anonymous account", async () => {
    const { db, updates } = makeDb({
      lowerDocs: [doc("s1", { ownerUid: "anon_1" })],
    });
    const res = await claimSessionsForUser(
      db as never,
      adminAuth({ anon_1: "anon" }) as never,
      user,
    );
    expect(res.claimed).toBe(1);
    expect(res.claimedShareIds).toEqual(["s1"]);
    expect(updates[0].data.ownerUid).toBe("verified_uid");
    expect(updates[0].data.emailLower).toBe("lead@example.com");
  });

  it("NEVER steals a session owned by a permanent account", async () => {
    const { db, updates } = makeDb({
      lowerDocs: [doc("s1", { ownerUid: "perm_1" })],
    });
    const res = await claimSessionsForUser(
      db as never,
      adminAuth({ perm_1: "permanent" }) as never,
      user,
    );
    expect(res.claimed).toBe(0);
    expect(res.skipped).toBe(1);
    expect(updates).toHaveLength(0);
  });

  it("claims a session whose owner uid no longer exists", async () => {
    const { db, updates } = makeDb({
      lowerDocs: [doc("s1", { ownerUid: "ghost" })],
    });
    const res = await claimSessionsForUser(
      db as never,
      adminAuth({ ghost: "missing" }) as never,
      user,
    );
    expect(res.claimed).toBe(1);
    expect(updates).toHaveLength(1);
  });

  it("is a no-op (uncounted) for sessions already owned by the user", async () => {
    const { db, updates } = makeDb({
      lowerDocs: [doc("s1", { ownerUid: "verified_uid" })],
    });
    const res = await claimSessionsForUser(
      db as never,
      adminAuth({}) as never,
      user,
    );
    expect(res.claimed).toBe(0);
    expect(res.skipped).toBe(0);
    expect(updates).toHaveLength(0);
  });

  it("dedupes a doc returned by both queries into a single write", async () => {
    const d = doc("s1", { ownerUid: "anon_1" });
    const { db, updates } = makeDb({ lowerDocs: [d], legacyDocs: [d] });
    const res = await claimSessionsForUser(
      db as never,
      adminAuth({ anon_1: "anon" }) as never,
      user,
    );
    expect(res.claimed).toBe(1);
    expect(updates).toHaveLength(1);
  });
});
