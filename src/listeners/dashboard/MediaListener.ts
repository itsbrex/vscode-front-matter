import { MediaHelpers } from '../../helpers/MediaHelpers';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { BaseListener } from './BaseListener';
import { DashboardCommand } from '../../dashboardWebView/DashboardCommand';
import { SortingOption } from '../../dashboardWebView/models';
import { commands, env, Uri } from 'vscode';
import { COMMAND_NAME } from '../../constants';
import * as os from 'os';
import { Folders } from '../../commands';
import { PostMessageData, UnmappedMedia } from '../../models';
import { FilesHelper, MediaLibrary } from '../../helpers';
import { existsAsync, flattenObjectKeys } from '../../utils';

export class MediaListener extends BaseListener {
  private static timers: { [folder: string]: any } = {};

  public static async process(msg: PostMessageData) {
    super.process(msg);

    const { page, folder, sorting } = msg.payload ?? {};

    switch (msg.command) {
      case DashboardMessage.getMedia:
        this.sendMediaFiles(page, folder, sorting);
        break;
      case DashboardMessage.refreshMedia:
        MediaHelpers.resetMedia();
        this.sendMediaFiles(0, msg?.payload?.folder);
        break;
      case DashboardMessage.uploadMedia:
        this.store(msg?.payload);
        break;
      case DashboardMessage.deleteMedia:
        this.delete(msg?.payload);
        break;
      case DashboardMessage.revealMedia:
        this.openFileInFinder(msg?.payload?.file);
        break;
      case DashboardMessage.insertMedia:
        MediaHelpers.insertMediaToMarkdown(msg?.payload);
        break;
      case DashboardMessage.insertFile:
        MediaHelpers.insertMediaToMarkdown(msg?.payload);
        break;
      case DashboardMessage.updateMediaMetadata:
        this.update(msg.payload);
        break;
      case DashboardMessage.getUnmappedMedia:
        this.getUnmappedMedia(msg);
        break;
      case DashboardMessage.remapMediaMetadata:
        this.remapMediaMetadata(msg);
        break;
      case DashboardMessage.createMediaFolder:
        await commands.executeCommand(COMMAND_NAME.createFolder, msg?.payload);
        break;
      case DashboardMessage.createHexoAssetFolder:
        if (msg?.payload.hexoAssetFolderPath) {
          Folders.createFolder(msg?.payload.hexoAssetFolderPath);
        }
        break;
    }
  }

  /**
   * Sends the media files to the dashboard
   * @param page
   * @param folder
   * @param sorting
   */
  public static async sendMediaFiles(page = 0, folder = '', sorting: SortingOption | null = null) {
    MediaLibrary.reset();
    const files = await MediaHelpers.getMedia(page, folder, sorting);
    this.sendMsg(DashboardCommand.media, files);
  }

  /**
   * Open file in finder or explorer
   * @param file
   */
  private static openFileInFinder(file: string) {
    if (file) {
      if (os.type() === 'Linux' && env.remoteName?.toLowerCase() === 'wsl') {
        commands.executeCommand('remote-wsl.revealInExplorer', Uri.parse(file));
      } else {
        commands.executeCommand('revealFileInOS', Uri.parse(file));
      }
    }
  }

  private static async remapMediaMetadata({ command, payload }: PostMessageData) {
    if (!payload || !command) {
      return;
    }

    const { unmappedItem, file, folder, page } = payload;

    if (!unmappedItem || !(unmappedItem as UnmappedMedia).absPath || !file) {
      return;
    }

    const mediaLib = MediaLibrary.getInstance();

    await mediaLib.rename((unmappedItem as UnmappedMedia).absPath, file);
    this.sendMediaFiles(page || 0, folder || '');
  }

  /**
   * Find all the unmapped media file with the given name
   * @param msg
   */
  private static async getUnmappedMedia({ command, payload, requestId }: PostMessageData) {
    if (!payload || !command || !requestId) {
      return;
    }

    const mediaLib = MediaLibrary.getInstance();
    const allMetadata = await mediaLib.getAll();
    const allFilePaths = flattenObjectKeys(allMetadata);

    const filesEndingWith = allFilePaths.filter((f) => f.endsWith(payload));

    // Check if the files exist
    const unmappedFiles: UnmappedMedia[] = [];
    for (const file of filesEndingWith) {
      const absPath = FilesHelper.relToAbsPath(file);
      if (!(await existsAsync(absPath))) {
        const parsedPath = mediaLib.parsePath(absPath);
        const metadata = await mediaLib.get(parsedPath);
        if (metadata) {
          unmappedFiles.push({
            file,
            absPath,
            metadata: {
              ...(metadata as { [key: string]: any })
            }
          } as UnmappedMedia);
        }
      }
    }

    if (unmappedFiles && unmappedFiles.length > 0) {
      this.sendRequest(command as DashboardCommand, requestId, unmappedFiles);
    }
  }

  /**
   * Store the file and send a message after multiple uploads
   * @param data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static async store(data: any) {
    try {
      const { folder } = data;
      await MediaHelpers.saveFile(data);

      const folderPath = `${folder}`;
      if (this.timers[folderPath]) {
        clearTimeout(this.timers[folderPath]);
        delete this.timers[folderPath];
      }

      this.timers[folderPath] = setTimeout(() => {
        MediaHelpers.resetMedia();
        this.sendMediaFiles(0, folder || '');
        delete this.timers[folderPath];
      }, 500);
    } catch {
      // Do nothing
    }
  }

  /**
   * Delete a media file
   * @param data
   */
  private static delete(data: { file: string; page: number; folder: string | null }) {
    try {
      MediaHelpers.deleteFile(data.file);
      this.sendMediaFiles(data.page || 0, data.folder || '');
    } catch {
      // Do nothing
    }
  }

  /**
   * Update media metadata
   * @param data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static async update(data: any) {
    try {
      const { page, folder } = data;

      await MediaHelpers.updateMetadata(data);

      this.sendMediaFiles(page || 0, folder || '');
    } catch {
      // Do nothing
    }
  }
}
