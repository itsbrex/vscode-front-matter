import { workspace, Uri } from "vscode";
import { CONFIG_KEY, SETTING_TEMPLATES_FOLDER } from "../constants";
import { join } from "path";
import * as fs from "fs";
import { Notifications } from "../helpers/Notifications";
import { Template } from "./Template";

export class Project {

  private static content = `---
title: "{{name}}"
slug: "/{{kebabCase name}}/"
description:
author: 
date: 2019-08-22T15:20:28.000Z
lastmod: 2019-08-22T15:20:28.000Z
draft: true
tags: []
categories: []
---
`;

  /**
   * Initialize a new "Project" instance.
   */
  public static async init(sampleTemplate: boolean = true) {
    try {
      const folder = Template.getSettings();
      const templatePath = Project.templatePath();

      if (!folder || !templatePath) {
        return;
      }
      
      const article = Uri.file(join(templatePath.fsPath, "article.md"));

      if (!fs.existsSync(templatePath.fsPath)) {
        await workspace.fs.createDirectory(templatePath);
      }

      if (sampleTemplate) {
        fs.writeFileSync(article.fsPath, Project.content, { encoding: "utf-8" });
        Notifications.info("Project initialized successfully.");
      }
    } catch (err) {
      Notifications.error(`Sorry, something went wrong - ${err?.message || err}`);
    }
  }

  /**
   * Get the template path for the current project
   */
  public static templatePath() {
    const folder = Template.getSettings();
    const workspaceFolders = workspace.workspaceFolders;

    if (!folder || !workspaceFolders || workspaceFolders.length === 0) {
      return null;
    }

    const workspaceFolder = workspaceFolders[0];
    const templatePath = Uri.file(join(workspaceFolder.uri.fsPath, folder));
    return templatePath;
  }
}