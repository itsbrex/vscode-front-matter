# VSCode Front Matter Helpers

> **Info**: Extension is still in development, but can already be tested out.

## Available commands:

**Front Matter: Create <tag | category>**
  - Creates a new <tag | category> and allows you to automatically include it into your post

![Create tag or category](./assets/create-tag-category.gif)
  
**Front Matter: Insert <tags | categories>**
  - Inserts a selected <tags | categories> into the front matter of your article/post/...

![Insert tags or categories](./assets/insert-tag-category.gif)

**Front Matter: Export all tags & categories to your settings**
  - Export all the already used tags & categories in your articles/posts/... to your user settings

**Front Matter: Set current date**

  - Update the `date` property of the current article/post/... to the current date & time.

> **Optional**: if you want, you can specify the format of the date property by adding your own preference in your settings. Settings key: `frontMatter.taxonomy.dateFormat`. Check [date-fns formating](https://date-fns.org/v2.0.1/docs/format) for more information which patterns you can use.

## Where is the data stored?

The tags and categories are stored in the project VSCode user settings. You can find them back under: `.vscode/settings.json`.

```json
{
  "frontMatter.taxonomy.tags": [],
  "frontMatter.taxonomy.categories": []
}
```

## Usage

- Start by opening the command prompt:
  - Windows ⇧+ctrl+P
  - Mac: ⇧+⌘+P
- Use one of the commands from above

## Feedback / issues / ideas

Please submit them via creating an issue in the project repository: [issue list](https://github.com/estruyf/vscode-front-matter/issues).