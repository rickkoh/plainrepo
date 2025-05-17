import { BrowserWindow } from 'electron';
import { FileNode } from '../../types/FileNode';
import { FileContent } from '../../types/FileContent';
import { generateDirectoryStructure } from '../utils/FileBuilder';
import { flattenFileNode } from '../../shared/utils/FileNodeUtils';
import { streamGetContent } from '../utils/ContentAggregator';
import TokenEstimator from '../utils/TokenEstimator';
import { ipcChannels } from '../../shared/ipcChannels';

export class FileContentService {
  private mainWindow: BrowserWindow | null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  /**
   * Updates the UI with file contents based on the provided root node
   * Handles:
   * - Clearing previous contents
   * - Generating directory tree
   * - Calculating token counts
   * - Streaming and sending file contents
   */
  public updateFileContents(
    rootFileNode: FileNode,
    options: { selectedOnly?: boolean } = {},
  ) {
    if (!this.mainWindow || !rootFileNode) {
      return;
    }

    // Reset token count and clear content
    this.mainWindow.webContents.send(ipcChannels.TOKEN_COUNT_SET, 0);
    this.mainWindow.webContents.send(ipcChannels.FILE_CONTENTS_CLEAR);

    // Generate and send directory tree
    const directoryTree = generateDirectoryStructure(rootFileNode, options);
    this.mainWindow.webContents.send(
      ipcChannels.DIRECTORY_TREE_SET,
      directoryTree,
    );

    // Calculate initial token count from directory tree
    let count = TokenEstimator.estimateTokens(directoryTree);
    this.mainWindow.webContents.send(ipcChannels.TOKEN_COUNT_SET, count);

    // Flatten file nodes for content processing
    const flattenedNode = flattenFileNode(rootFileNode, options);

    // Stream content in chunks and update UI
    streamGetContent(flattenedNode, (fileContents: FileContent[]) => {
      if (!this.mainWindow) {
        return;
      }

      // Update token count
      for (let i = 0; i < fileContents.length; i += 1) {
        const fileContent = fileContents[i];
        count += TokenEstimator.estimateTokens(fileContent.content);
      }

      this.mainWindow.webContents.send(ipcChannels.TOKEN_COUNT_SET, count);
      this.mainWindow.webContents.send(
        ipcChannels.FILE_CONTENTS_ADD,
        fileContents,
      );
    });
  }
}

// Factory function for creating a new service instance
export function createFileContentService(
  mainWindow: BrowserWindow,
): FileContentService {
  return new FileContentService(mainWindow);
}
