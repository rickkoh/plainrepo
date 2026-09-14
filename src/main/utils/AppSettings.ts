/* eslint-disable no-console */

import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { AppSettings, AppSettingsSchema } from '@/src/types/AppSettings';
import shouldExclude, { buildRegexes } from './Excluder';

const USER_DATA_PATH = path.join(app.getPath('userData'), 'AppSettings.json');
/**
 * Reads the app settings from the user data path
 * @returns The app settings
 */
export function readAppSettings(): AppSettings {
  try {
    const data = JSON.parse(fs.readFileSync(USER_DATA_PATH, 'utf-8'));
    const parsedData = AppSettingsSchema.parse(data);
    return parsedData;
  } catch (error) {
    console.error('Failed to read app settings', error);
    return AppSettingsSchema.parse({
      shouldIncludeGitIgnore: true,
    });
  }
}

/**
 * Writes the app settings to the user data path
 * @param appSettings The app settings to write
 */
export function writeAppSettings(appSettings: AppSettings) {
  try {
    const safeAppSettings = AppSettingsSchema.parse(appSettings);
    fs.writeFileSync(USER_DATA_PATH, JSON.stringify(safeAppSettings));
  } catch (error) {
    console.warn('Failed to write app settings', error);
  }
}

/**
 * Creates an ignore function for chokidar that matches exclude patterns
 * against the file or directory name, the same way the explorer does
 * @param patterns Array of exclude patterns
 * @returns A function that returns true if the path should be ignored
 */
export function globToRegex(patterns: string[]): (filePath: string) => boolean {
  const excludeRegexes = buildRegexes(patterns);

  // path.basename handles both '/' and '\' separators on Windows
  return (filePath: string) =>
    shouldExclude(path.basename(filePath), excludeRegexes);
}
