import { Folders } from './Folders';
import { ViewColumn, commands, version, workspace } from 'vscode';
import ContentProvider from '../providers/ContentProvider';
import { join } from 'path';
import { ContentFolder } from '../models';
import { Settings } from '../helpers/SettingsHelper';
import {
  COMMAND_NAME,
  DEFAULT_FILE_TYPES,
  SETTING_CONTENT_SUPPORTED_FILETYPES
} from '../constants';
import { Extension } from '../helpers';

export class Diagnostics {
  public static async registerCommands() {
    const ext = Extension.getInstance();
    const subscriptions = ext.subscriptions;

    subscriptions.push(commands.registerCommand(COMMAND_NAME.diagnostics, Diagnostics.show));
  }

  public static async show() {
    const folders = await Folders.get();
    const projectName = Folders.getProjectFolderName();
    const wsFolder = Folders.getWorkspaceFolder();

    const folderData = [];
    for (const folder of folders) {
      folderData.push(await Diagnostics.processFolder(folder, projectName));
    }

    const all = await Diagnostics.allProjectFiles();

    const fileTypes = Diagnostics.getFileTypes();

    const logging = `# ${Extension.getInstance().displayName} - Diagnostics

Beta: \`${Extension.getInstance().isBetaVersion()}\`
Version: \`${Extension.getInstance().version}\`
OS: \`${process.platform}\`
VSCode version: \`${version}\`
    
## Project name

${projectName}

## Workspace folder

\`${wsFolder ? wsFolder.fsPath : 'No workspace folder'}\`

## Total files

${all}

## Folders

| Title | Path |
| ----- | ---- |
${folders.map((f) => `| ${f.title} | \`${f.path}\` |`).join('\n')}

### Files in folders

| Project start length | Search in | ${fileTypes.join(` | `)} |
|--- | --- | --- | --- | --- |
${folderData.join('\n')}

## Complete frontmatter.json config

\`\`\`json
${JSON.stringify(Settings.globalConfig, null, 2)}
\`\`\`
    `;

    ContentProvider.show(logging, `${projectName} diagnostics`, 'markdown', ViewColumn.One);
  }

  private static getFileTypes = (): string[] => {
    return Settings.get<string[]>(SETTING_CONTENT_SUPPORTED_FILETYPES) || DEFAULT_FILE_TYPES;
  };

  private static async allProjectFiles() {
    const allFiles = await workspace.findFiles(`**/*.*`, '**/node_modules/**');
    return `Total files found: ${allFiles.length}`;
  }

  private static async processFolder(folder: ContentFolder, projectName: string) {
    let projectStart = folder.path.split(projectName).pop();
    projectStart = projectStart || '';
    projectStart = projectStart?.replace(/\\/g, '/');
    projectStart = projectStart?.startsWith('/') ? projectStart.substring(1) : projectStart;

    const fileTypes = Diagnostics.getFileTypes();
    const fileTypeLengths = await Promise.all(
      fileTypes.map(async (ft) => {
        const path = join(projectStart || '', folder.excludeSubdir ? '/' : '**/', `*.${ft}`);
        const files = await workspace.findFiles(path, '**/node_modules/**');
        return (files || []).length;
      })
    );

    return `| ${projectStart.length} | \`${join(
      projectStart,
      folder.excludeSubdir ? '/' : '**/',
      '*.*'
    )}\` | ${fileTypeLengths.join(` | `)} |`;
  }
}
