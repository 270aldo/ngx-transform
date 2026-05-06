import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

type FirestoreIndex = {
  collectionGroup: string;
  fields: Array<{ fieldPath: string; order?: string; arrayConfig?: string }>;
};

function hasIndex(indexes: FirestoreIndex[], collectionGroup: string, fields: string[]) {
  return indexes.some(
    (index) =>
      index.collectionGroup === collectionGroup &&
      fields.every((field, position) => index.fields[position]?.fieldPath === field)
  );
}

describe("Firestore production indexes", () => {
  const config = JSON.parse(readFileSync("firestore.indexes.json", "utf8")) as {
    indexes: FirestoreIndex[];
  };

  it("covers launch-critical composite queries", () => {
    expect(hasIndex(config.indexes, "sessions", ["ownerUid", "createdAt"])).toBe(true);
    expect(hasIndex(config.indexes, "sessions", ["status", "createdAt"])).toBe(true);
    expect(hasIndex(config.indexes, "email_sequences", ["status", "nextSend"])).toBe(true);
    expect(hasIndex(config.indexes, "jobs", ["status", "updatedAt"])).toBe(true);
    expect(hasIndex(config.indexes, "referrals", ["inviteeId", "completedAt"])).toBe(true);
    expect(hasIndex(config.indexes, "referrals", ["referrerId", "rewardClaimed", "completedAt"])).toBe(true);
  });
});
