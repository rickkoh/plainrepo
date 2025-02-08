import { z } from 'zod';

export const ExcludeSchema = z.array(z.string());

export const AppSettingsSchema = z.object({
  darkMode: z.boolean().optional(),
  exclude: ExcludeSchema.optional(),
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;
export type Exclude = z.infer<typeof ExcludeSchema>;
