import {prompts as seedPrompts} from "@/lib/data";
import {rowToPrompt} from "@/lib/mappers";
import {createServerSupabase} from "@/lib/supabase/server";
import {createSupabaseAdmin} from "@/lib/supabase/admin";
import type {PromptItem} from "@/lib/types";

export async function getPublishedPrompts(): Promise<PromptItem[]> {
  const supabase = await createServerSupabase();

  if (!supabase) {
    return developmentCatalog();
  }

  const {data, error} = await supabase.rpc("get_prompt_catalog");

  if (error || !data) {
    console.error(JSON.stringify({level: "error", message: "Prompt catalog query failed", error: error?.message}));

    if (process.env.NODE_ENV !== "production") {
      return developmentCatalog();
    }

    throw new Error("Prompt catalog is temporarily unavailable.");
  }

  return data.map((row: unknown) => rowToPrompt(row as PromptRowLike));
}

export async function getAllPromptsForAdmin(): Promise<PromptItem[]> {
  const admin = createSupabaseAdmin();

  if (!admin) {
    return seedPrompts.map((prompt) => ({...prompt, status: "Published"}));
  }

  const {data, error} = await admin.from("prompts").select("*").order("id", {ascending: true});

  if (error || !data) {
    throw new Error(`Unable to load admin prompt catalog: ${error?.message ?? "Unknown error"}`);
  }

  return data.map((row) => rowToPrompt(row as PromptRowLike));
}

type PromptRowLike = Parameters<typeof rowToPrompt>[0];

function developmentCatalog(): PromptItem[] {
  return seedPrompts.map((prompt) => ({
    ...prompt,
    prompt: prompt.access === "Free" ? prompt.prompt : null,
    status: "Published",
  }));
}
