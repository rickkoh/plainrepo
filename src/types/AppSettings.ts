import { z } from 'zod';

export const AppSettingsSchema = z.object({
  darkMode: z.boolean().optional(),
  ignore: z.array(z.string()).optional(),
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;
