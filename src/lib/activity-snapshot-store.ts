import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activitySnapshots } from "@/db/schema";
import {
  activitySnapshotSchemaVersion,
  type ActivitySnapshot,
  type ActivitySnapshotStore,
} from "@/lib/github-activity";

export const databaseActivitySnapshotStore: ActivitySnapshotStore = {
  async load(githubIdentity) {
    const [row] = await db
      .select()
      .from(activitySnapshots)
      .where(eq(activitySnapshots.githubIdentity, githubIdentity))
      .limit(1);

    if (!row || row.schemaVersion !== activitySnapshotSchemaVersion) {
      return null;
    }

    return {
      schemaVersion: activitySnapshotSchemaVersion,
      githubIdentity: row.githubIdentity,
      collectedAt: row.collectedAt.toISOString(),
      source: "GitHub REST API",
      window: row.window,
      metrics: row.metrics,
    };
  },

  async save(snapshot: ActivitySnapshot) {
    await db
      .insert(activitySnapshots)
      .values({
        githubIdentity: snapshot.githubIdentity,
        schemaVersion: snapshot.schemaVersion,
        collectedAt: new Date(snapshot.collectedAt),
        source: snapshot.source,
        window: snapshot.window,
        metrics: snapshot.metrics,
      })
      .onConflictDoUpdate({
        target: activitySnapshots.githubIdentity,
        set: {
          schemaVersion: snapshot.schemaVersion,
          collectedAt: new Date(snapshot.collectedAt),
          source: snapshot.source,
          window: snapshot.window,
          metrics: snapshot.metrics,
        },
      });
  },
};
