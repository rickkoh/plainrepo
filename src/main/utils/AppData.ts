import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { createHash } from 'crypto';
import { TabDataArray, TabDataArraySchema } from '@/src/types/TabData';

const WORKSPACE_DIR = path.join(app.getPath('userData'), 'workspace');
const WORKSPACE_FILENAME = 'Workspace.json';

// Ensure that a directory exists, creating it recursively if needed.
function ensureDirectoryExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Saves the workspace data for a given project path.
 *
 * @param projectPathStr - The original project path.
 * @param tabData - The array of tab data to save.
 */
export function saveWorkspace(
  projectPathStr: string,
  tabData: TabDataArray,
): void {
  // Compute a hash for the project path.
  const hash = createHash('sha256').update(projectPathStr).digest('hex');
  const projectDir = path.join(WORKSPACE_DIR, hash);

  // Ensure the project directory exists.
  ensureDirectoryExists(projectDir);

  // Validate the tab data.
  const safeTabData = TabDataArraySchema.parse(tabData);

  const workspaceFilePath = path.join(projectDir, WORKSPACE_FILENAME);
  fs.writeFileSync(
    workspaceFilePath,
    JSON.stringify(safeTabData, null, 2),
    'utf8',
  );
}

/**
 * Loads the workspace data for a given project path.
 *
 * @param projectPathStr - The original project path.
 * @returns The parsed tab data.
 * @throws If the workspace file does not exist or cannot be parsed.
 */
export function loadWorkspace(projectPathStr: string): TabDataArray {
  const hash = createHash('sha256').update(projectPathStr).digest('hex');
  const projectDir = path.join(WORKSPACE_DIR, hash);
  const workspaceFilePath = path.join(projectDir, WORKSPACE_FILENAME);

  if (!fs.existsSync(workspaceFilePath)) {
    throw new Error(`Workspace file not found at ${workspaceFilePath}`);
  }

  const fileContents = fs.readFileSync(workspaceFilePath, 'utf8');
  const data = JSON.parse(fileContents);
  return TabDataArraySchema.parse(data);
}
