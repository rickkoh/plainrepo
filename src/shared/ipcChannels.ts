// src/shared/ipc-channels.ts
export const ipcChannels = {
  // Workspace
  WORKSPACE_PATH_SET: 'workspace:path',
  WORKSPACE_FILENODE_SET: 'workspace:fileNode',

  // File contents
  FILE_CONTENTS_CLEAR: 'fileContents:clear',
  FILE_CONTENTS_ADD: 'fileContents:add',

  // Directory tree
  DIRECTORY_TREE_SET: 'directoryTree:set',

  // Stats
  TOKEN_COUNT_SET: 'tokenCount:set',

  // App settings
  APP_SETTINGS_READ: 'appSettings:read',
  APP_SETTINGS_UPDATE: 'appSettings:update',

  // Dialogs
  DIALOG_OPEN_DIRECTORY: 'dialog:openDirectory',
} as const;

export type IPCChannel = (typeof ipcChannels)[keyof typeof ipcChannels];
