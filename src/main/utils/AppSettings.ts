import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { AppSettings, AppSettingsSchema } from '@/src/types/AppSettings';

const USER_DATA_PATH = path.join(app.getPath('userData'), 'AppSettings.json');

export function readAppSettings(): AppSettings {
  try {
    const data = JSON.parse(fs.readFileSync(USER_DATA_PATH, 'utf-8'));
    const parsedData = AppSettingsSchema.parse(data);
    return parsedData;
  } catch (error) {
    return {};
  }
}

export function writeAppSettings(appSettings: AppSettings) {
  try {
    const safeAppSettings = AppSettingsSchema.parse(appSettings);
    fs.writeFileSync(USER_DATA_PATH, JSON.stringify(safeAppSettings));
  } catch (error) {
    console.warn('Failed to write app settings', error);
  }
}
