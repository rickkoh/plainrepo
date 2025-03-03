import { z } from 'zod';

export const ExcludeItemSchema = z.string();
export const ExcludeListSchema = z.array(ExcludeItemSchema);
export const ReplaceItemSchema = z.object({ from: z.string(), to: z.string() });
export const ReplaceListSchema = z.array(ReplaceItemSchema);
export const ShouldIncludeGitIgnoreSchema = z.boolean();
export const CopyLimitSchema = z.number();

export const AppSettingsSchema = z.object({
  darkMode: z.boolean().optional(),
  exclude: ExcludeListSchema.optional(),
  replace: ReplaceListSchema.optional(),
  shouldIncludeGitIgnore: ShouldIncludeGitIgnoreSchema.optional(),
  copyLimit: CopyLimitSchema.optional(),
});

export type ExcludeItem = z.infer<typeof ExcludeItemSchema>;
export type ExcludeList = z.infer<typeof ExcludeListSchema>;
export type ReplaceItem = z.infer<typeof ReplaceItemSchema>;
export type ReplaceList = z.infer<typeof ReplaceListSchema>;
export type ShouldIncludeGitIgnore = z.infer<
  typeof ShouldIncludeGitIgnoreSchema
>;
export type CopyLimit = z.infer<typeof CopyLimitSchema>;
export type AppSettings = z.infer<typeof AppSettingsSchema>;
