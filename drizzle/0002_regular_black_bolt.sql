CREATE TABLE "activity_snapshots" (
	"github_identity" text PRIMARY KEY NOT NULL,
	"schema_version" integer NOT NULL,
	"collected_at" timestamp with time zone NOT NULL,
	"source" text NOT NULL,
	"activity_window" jsonb NOT NULL,
	"metrics" jsonb NOT NULL
);
