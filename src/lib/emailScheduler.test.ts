import { beforeEach, describe, expect, it, vi } from "vitest";
import { advanceSequence } from "./emailScheduler";
import { getDb } from "./firebaseAdmin";

vi.mock("./firebaseAdmin", () => ({ getDb: vi.fn() }));

function mockDb(docData: Record<string, unknown> | null) {
  const update = vi.fn();
  const txGet = vi.fn(async () => ({
    exists: docData !== null,
    data: () => docData,
  }));
  const runTransaction = vi.fn(
    async (cb: (tx: { get: typeof txGet; update: typeof update }) => unknown) =>
      cb({ get: txGet, update }),
  );
  vi.mocked(getDb).mockReturnValue({
    collection: () => ({ doc: () => ({ id: "share_1" }) }),
    runTransaction,
  } as never);
  return { update, runTransaction };
}

describe("advanceSequence (fix-19, transactional)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("advances to the next stage inside a Firestore transaction", async () => {
    const { update, runTransaction } = mockDb({
      stage: "D0",
      sentEmails: [],
      status: "active",
    });

    const next = await advanceSequence("share_1");

    expect(runTransaction).toHaveBeenCalledTimes(1);
    expect(next).toBe("D1");
    expect(update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ stage: "D1" }),
    );
  });

  it("completes the sequence when there is no next stage", async () => {
    const { update } = mockDb({ stage: "D14", sentEmails: [], status: "active" });

    const next = await advanceSequence("share_1");

    expect(next).toBeNull();
    expect(update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ status: "completed" }),
    );
  });

  it("returns null (no write) when the sequence doc is missing", async () => {
    const { update } = mockDb(null);

    const next = await advanceSequence("missing");

    expect(next).toBeNull();
    expect(update).not.toHaveBeenCalled();
  });
});
