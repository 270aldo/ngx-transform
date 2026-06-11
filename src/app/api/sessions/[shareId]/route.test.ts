import { beforeEach, describe, expect, it, vi } from "vitest";

const { purgeSessionLinkedData, purgeLeadRecords, refDelete } = vi.hoisted(
  () => ({
    purgeSessionLinkedData: vi.fn(async () => undefined),
    purgeLeadRecords: vi.fn(async () => undefined),
    refDelete: vi.fn(async () => undefined),
  }),
);

vi.mock("@/lib/sessionPurge", () => ({
  purgeSessionLinkedData,
  purgeLeadRecords,
}));

vi.mock("@/lib/storage", () => ({
  deletePath: vi.fn(async () => undefined),
  deletePrefix: vi.fn(async () => undefined),
  getSignedUrl: vi.fn(async () => "https://signed.example"),
}));

vi.mock("@/lib/jobManager", () => ({
  validateDeleteToken: vi.fn(async () => true),
}));

vi.mock("@/lib/authServer", () => ({
  isSessionOwnerAuthError: () => false,
  requireSessionOwner: vi.fn(),
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  getDb: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(async () => ({
          exists: true,
          data: () => ({
            email: "lead@example.com",
            photo: { originalStoragePath: "uploads/u/seed/original.jpg" },
            assets: { images: { m4: "sessions/s1/m4.jpg" } },
          }),
        })),
        delete: refDelete,
      })),
    })),
  })),
}));

import { DELETE } from "./route";

function request(token: string) {
  return new Request("https://ngx.test/api/sessions/s1", {
    method: "DELETE",
    headers: { "X-Delete-Token": token },
  });
}

describe("DELETE /api/sessions/[shareId] complete purge (fix-10)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("purges session-linked data and the owner's lead records, then deletes the doc", async () => {
    const res = await DELETE(request("valid-token") as never, {
      params: Promise.resolve({ shareId: "s1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(purgeSessionLinkedData).toHaveBeenCalledWith(expect.anything(), [
      "s1",
    ]);
    expect(purgeLeadRecords).toHaveBeenCalledWith(
      expect.anything(),
      "lead@example.com",
    );
    expect(refDelete).toHaveBeenCalled();
  });
});
