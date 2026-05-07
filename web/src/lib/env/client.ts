import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  v === "" || v === undefined ? undefined : v;

const clientSchema = z.object({
  NEXT_PUBLIC_DISPLAY_NAME: z.string().min(1).default("NBW"),
  NEXT_PUBLIC_GITHUB_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().optional(),
  ),
});

export type ClientEnv = z.infer<typeof clientSchema>;

export const clientEnv: ClientEnv = clientSchema.parse({
  NEXT_PUBLIC_DISPLAY_NAME: process.env.NEXT_PUBLIC_DISPLAY_NAME,
  NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
});
