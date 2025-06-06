// src/shared/ipc-channels.ts
export const ipcChannels = {
  // Workspace
  WORKSPACE_PATH_SET: 'workspace:path',
  WORKSPACE_FILENODE_SET: 'workspace:fileNode',
  WORKSPACE_FILENODE_UPDATE: 'workspace:fileNodeUpdate',
  WORKSPACE_FILENODE_DELETE: 'workspace:fileNodeDelete',

  // Directory
  FILE_NODE_UPDATE: 'fileNode:update',
  DIRECTORY_COLLAPSE: 'directory:collapse',

  FILE_NODE_SELECTION_CHANGED: 'fileNode:selectionChanged',

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

  // Notifications
  NOTIFICATION_SEND: 'notification:send',
} as const;

export type IPCChannel = (typeof ipcChannels)[keyof typeof ipcChannels];
