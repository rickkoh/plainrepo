/* eslint-disable no-console */

import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { AppSettings, AppSettingsSchema } from '@/src/types/AppSettings';

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
 * Creates an ignore function for chokidar that matches glob patterns
 * @param patterns Array of glob patterns to convert
 * @returns A function that returns true if the path should be ignored
 */
export function globToRegex(patterns: string[]): (filePath: string) => boolean {
  const regexPatterns = patterns.map((pattern) => {
    // Handle special cases first
    if (pattern === '.**') {
      return '\\.\\w+.*'; // Matches any hidden file/directory
    }

    // Convert glob patterns to regex
    return pattern
      .replace(/\./g, '\\.') // Escape dots
      .replace(/\*\*/g, '.*') // Convert ** to .*
      .replace(/\*/g, '[^/]*') // Convert * to [^/]* (any chars except /)
      .replace(/\?/g, '[^/]') // Convert ? to [^/] (any single char except /)
      .replace(/\[/g, '\\[') // Escape [
      .replace(/\]/g, '\\]') // Escape ]
      .replace(/\(/g, '\\(') // Escape (
      .replace(/\)/g, '\\)') // Escape )
      .replace(/\{/g, '\\{') // Escape {
      .replace(/\}/g, '\\}') // Escape }
      .replace(/\^/g, '\\^') // Escape ^
      .replace(/\$/g, '\\$') // Escape $
      .replace(/\|/g, '\\|') // Escape |
      .replace(/\+/g, '\\+') // Escape +
      .replace(/\\/g, '\\\\'); // Escape backslash
  });

  // Create the regex
  const regex = new RegExp(`^(?:${regexPatterns.join('|')})$`);

  // Return a function that checks if the path should be ignored
  return (filePath: string) => {
    // Get the basename of the path (last part after the last slash)
    const basename = filePath.split('/').pop() || '';
    // Check if either the full path or the basename matches any of our patterns
    return regex.test(filePath) || regex.test(basename);
  };
}
