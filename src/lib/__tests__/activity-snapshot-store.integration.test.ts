import { afterEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

vi.mock("server-only", () => ({}));

import { db } from "@/db";
import { activitySnapshots } from "@/db/schema";
import { databaseActivitySnapshotStore } from "@/lib/activity-snapshot-store";
import type { ActivitySnapshot } from "@/lib/github-activity";

const githubIdentity = "__test-activity-snapshot__";

const snapshotAt = (collectedAt: string): ActivitySnapshot => ({
  schemaVersion: 1,
  githubIdentity,
  collectedAt,
  source: "GitHub REST API",
  window: {
    timeZone: "Asia/Shanghai",
    durationDays: 30,
    startsAt: "2026-08-05T16:00:00.000Z",
    endsAt: collectedAt,
  },
  metrics: {
    eligibleProjectCount: 4,
    activeProjectCount: 2,
    mostRecentOwnerCommitAt: "2026-08-28T01:00:00.000Z",
    primaryLanguageDistribution: [
      { language: "TypeScript", projectCount: 3 },
      { language: "Python", projectCount: 1 },
    ],
  },
});

afterEach(async () => {
  await db
    .delete(activitySnapshots)
    .where(eq(activitySnapshots.githubIdentity, githubIdentity));
});

describe("databaseActivitySnapshotStore", () => {
  it("persists and replaces the latest successful snapshot by GitHub Identity", async () => {
    await databaseActivitySnapshotStore.save(
      snapshotAt("2026-09-04T09:00:00.000Z"),
    );
    const latest = snapshotAt("2026-09-04T10:00:00.000Z");

    await databaseActivitySnapshotStore.save(latest);

    await expect(databaseActivitySnapshotStore.load(githubIdentity)).resolves.toEqual(
      latest,
    );
    const rows = await db
      .select()
      .from(activitySnapshots)
      .where(eq(activitySnapshots.githubIdentity, githubIdentity));
    expect(rows).toHaveLength(1);
  });
});
