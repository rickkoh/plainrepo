import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { UserData, UserDataSchema } from '@/src/types/UserData';

const USER_DATA_PATH = path.join(app.getPath('userData'), 'user_data.json');

export function readUserData(): UserData {
  try {
    const data = JSON.parse(fs.readFileSync(USER_DATA_PATH, 'utf-8'));
    const parsedData = UserDataSchema.parse(data);
    return parsedData;
  } catch (error) {
    return {};
  }
}

export function writeUserData(data: UserData) {
  fs.writeFileSync(USER_DATA_PATH, JSON.stringify(data));
}
