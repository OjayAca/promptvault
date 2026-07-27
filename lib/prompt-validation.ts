import {categories} from "@/lib/data";
import {cleanString} from "@/lib/validation";
import type {AccessLevel, PromptCategory, PromptStatus} from "@/lib/types";

const accessLevels: AccessLevel[] = ["Free", "Premium"];
const statuses: PromptStatus[] = ["Draft", "Published", "Archived"];

type PromptPayload =
  | {error: string}
  | {
      title: string;
      category: PromptCategory;
      access: AccessLevel;
      status: PromptStatus;
      purpose: string;
      prompt: string;
      best_for: string;
      tags: string[];
      updated_at: string;
    };

export function toPromptPayload(body: Record<string, unknown>): PromptPayload {
  const title = cleanString(body.title, 160);
  const purpose = cleanString(body.purpose, 500);
  const prompt = cleanString(body.prompt, 12000);
  const bestFor = cleanString(body.bestFor, 500);
  const category = body.category as PromptCategory;
  const access = body.access as AccessLevel;
  const status = body.status as PromptStatus;
  const tags = cleanString(body.tags, 1000)
    .split(",")
    .map((tag) => tag.trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 20);

  if (!title || !purpose || !prompt || !bestFor) {
    return {error: "Title, purpose, prompt, and best-for fields are required."};
  }

  if (!categories.filter((item) => item !== "All").includes(category)) {
    return {error: "Invalid category."};
  }

  if (!accessLevels.includes(access) || !statuses.includes(status)) {
    return {error: "Invalid access level or status."};
  }

  return {
    title,
    category,
    access,
    status,
    purpose,
    prompt,
    best_for: bestFor,
    tags,
    updated_at: new Date().toISOString(),
  };
}
