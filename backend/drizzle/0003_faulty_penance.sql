CREATE TABLE "generated_games" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"game_name" varchar(150) NOT NULL,
	"prompt" text NOT NULL,
	"files" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'ready' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generated_games" ADD CONSTRAINT "generated_games_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;