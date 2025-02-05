import { z } from 'zod';

export const UserDataSchema = z.object({
  darkMode: z.boolean().optional(),
});

export type UserData = z.infer<typeof UserDataSchema>;
