import { beforeEach, describe, expect, it, vi } from "vitest";

const { deletePrefix } = vi.hoisted(() => ({
  deletePrefix: vi.fn(async () => undefined),
}));
vi.mock("@/lib/storage", () => ({ deletePrefix }));

import { purgeSessionLinkedData, purgeLeadRecords } from "./sessionPurge";

function makeDb() {
  const batchDeletes: Array<{ collection: string; id: string }> = [];
  const queried: string[] = [];
  const batch = {
    delete: (ref: { collection: string; id: string }) => batchDeletes.push(ref),
    commit: vi.fn(async () => undefined),
  };
  const db = {
    batch: () => batch,
    collection: (name: string) => ({
      doc: (id: string) => ({ collection: name, id }),
      where: () => {
        queried.push(name);
        return { get: async () => ({ empty: true, docs: [] }) };
      },
    }),
  };
  return { db, batchDeletes, queried };
}

describe("purgeSessionLinkedData (fix-10)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes transform_reports + email_sequences docs and the report PDF prefix", async () => {
    const { db, batchDeletes } = makeDb();
    await purgeSessionLinkedData(db as never, ["s1"]);

    expect(deletePrefix).toHaveBeenCalledWith("reports/s1/");
    expect(batchDeletes).toEqual(
      expect.arrayContaining([
        { collection: "transform_reports", id: "s1" },
        { collection: "email_sequences", id: "s1" },
      ]),
    );
  });

  it("queries jobs and session_metrics by sessionId", async () => {
    const { db, queried } = makeDb();
    await purgeSessionLinkedData(db as never, ["s1"]);
    expect(queried).toEqual(expect.arrayContaining(["jobs", "session_metrics"]));
  });

  it("does not throw when storage deletion fails", async () => {
    deletePrefix.mockRejectedValueOnce(new Error("storage down"));
    const { db } = makeDb();
    await expect(
      purgeSessionLinkedData(db as never, ["s1"]),
    ).resolves.toBeUndefined();
  });

  it("is a no-op for an empty session list", async () => {
    const { db, batchDeletes } = makeDb();
    await purgeSessionLinkedData(db as never, []);
    expect(batchDeletes).toHaveLength(0);
    expect(deletePrefix).not.toHaveBeenCalled();
  });
});

describe("purgeLeadRecords (fix-10)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes leads + remarketing_leads with a normalized (lowercased) email", async () => {
    const { db, batchDeletes } = makeDb();
    await purgeLeadRecords(db as never, "  USER@Example.COM ");
    expect(batchDeletes).toEqual(
      expect.arrayContaining([
        { collection: "leads", id: "user@example.com" },
        { collection: "remarketing_leads", id: "user@example.com" },
      ]),
    );
  });

  it("is a no-op without an email", async () => {
    const { db, batchDeletes } = makeDb();
    await purgeLeadRecords(db as never, undefined);
    await purgeLeadRecords(db as never, "   ");
    expect(batchDeletes).toHaveLength(0);
  });
});
