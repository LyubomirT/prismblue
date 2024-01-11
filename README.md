![Prismblue Logo](brand/pbbanner.png)

Welcome to the Prismblue repository! It's a simple text editor with a neat UI and some cool features which doesn't consume much! It's written in pure JavaScript and uses the [Electron](https://www.electronjs.org/) framework. Prismblue is open-source and is licensed under the [GPL-3.0 License](LICENSE), available for Windows, macOS, and Linux.

## Features

The Prismblue text editor offers the following features:

- Open, save, and save as files in any format
- A visual solution to editing your text
- Customizable editor look and feel
- Review the status of your file in one place
- Possibility to restore an automatically created backup of your file

## Installation

### Classic (Windows)

This installation method is for Windows users who want to install Prismblue as a typical desktop application (portable installation).

1. Download the latest release from the [Releases](https://github.com/LyubomirT/prismblue/releases) page. For each release there are files for Windows, macOS, and Linux. Download the file for Windows that matches your system architecture (32-bit or 64-bit).
2. Extract the downloaded zip file.
3. Run the `Prismblue.exe` file.
4. You're done! Now Prismblue should be running and you should see the main window.

### Git (Windows, macOS, Linux)

If you don't want to download a release, you can clone the repository and run Prismblue from the source code (or build it yourself).

1. Install [Git](https://git-scm.com/downloads) for your operating system (should generall be available for most operating systems on most architectures).
2. Clone the repository by running the following command in your terminal:

```bash
git clone https://github.com/LyubomirT/prismblue.git
```

3. Change the directory to the cloned repository:

```bash
cd prismblue
```

4. Install the dependencies:

```bash
npm install
```

5. Run Prismblue:

```bash
npm run start
```

6. Prismblue is running and if everything went well, you should see the main window.

## Using Prismblue

Prismblue itself is pretty simple to use and is very intuitive. However, some of the features might not be so obvious, so here's a quick guide on how to use them.

### The Interface

![The Prismblue Interface](docs/ui_1.png)

On the image above you can see the Prismblue interface. It consists of the following parts:

- The titlebar
- The menu (or submenu) buttons
- The editor
- The status bar

#### The Titlebar

The titlebar is the topmost part of the interface. On the very left you can see the logo of Prismblue. Then comes the menu buttons, such as "File", "Edit", etc. In the middle there is the title of the current file. At the right there are the minimize, maximize, and close buttons.

#### Submenu Buttons

This widget contains the buttons for the menus. For example, when you click on the "File" button, the submenu buttons will show the buttons for the "File" menu ("New", "Open", etc.). Clicking on the currently active menu button will hide the submenu buttons and leave the widget empty.

#### The Editor

The editor is the main part of the interface. There you can edit or view your text. It's scrollable and is pretty much infinite in size (as long as your RAM can handle it).

#### The Status Bar

The status bar is the bottommost part of the interface. It contains information about the current file, such as the filename, the changes status, the row and column, and the total size of the file.

### Customizing the Editor

Prismblue offers quite a few options for customizing the editor. For example, you can change the theme, the font, the font size, and the status bar visibility. To see all your options, click on the "View" button in the menu.

> [!IMPORTANT]
> All your preferences will be **automatically saved** and will be loaded the next time you open Prismblue.

### Fullscreen Mode

You can toggle fullscreen mode by clicking on the "View" button in the menu and then clicking on the "Toggle Fullscreen" button in the submenu. You can also use the keyboard shortcut for toggling fullscreen mode (`F11`).

### Opening and Saving Files

To open a file, click on the "File" button in the menu and then click on the "Open" button in the submenu. Then select the file you want to open. Prismblue supports all file formats... but anything that's encoded will most likely look like gibberish.

To save a file, click on the "File" button in the menu and then click on the "Save" button in the submenu. If you haven't opened a file yet, then Prismblue will ask you to select a file to save to. "Save As" is the same as "Save", but it will always ask you to select a file to save to, creating a new file (or overwriting an existing one) in the process.

>[!TIP]
> You can also use the keyboard shortcuts for saving files. To save a file, press `Ctrl+S`. To save a file as, press `Ctrl+Shift+S`.

### The Action History

Prismblue has an action history, which allows you to undo and redo your actions. To see the action history, click on the "History" button in the menu. Then you can click on the "Undo" and "Redo" buttons to undo and redo your actions respectively.

### Restoring a File

Let's say you accidentally closed Prismblue and you didn't save your file. Prismblue automatically creates a backup of your file any time you change something. To restore your file, click on the "History" button in the menu and then click on the "Restore" button in the submenu. Then click on the "Yes" button in the modal that appears. Your file should be restored.

> [!CAUTION]
> If you interact with Prismblue in any way after you close it, then the backup will be lost and you won't be able to restore your file.

### Finding and Replacing Text

This text editor allows you to find text in your file and jump to it or replace it. If you want to find something, simply click on the "Edit" button in the menu and then click on the "Find" button in the submenu. In the modal that appears, enter the text you want to find and then click on the "Find Next" button to jump to the next occurrence of the text or click on the "Find Previous" button to jump to the previous occurrence of the text. You can also replace the current occurrence of the text by entering the text you want to replace it with and then clicking on the "Replace" button. To not bother yourself spamming the "Replace" button, you can replace all the occurrences of the text by clicking on the "Replace All" button.

### Copying, Pasting, and Cutting Text

Most likely you won't ever need to use these buttons, but in the "Edit" menu you can find the "Copy", "Paste", and "Cut" buttons. They work just like the keyboard shortcuts for copying, pasting, and cutting text.

(In case you don't know, the keyboard shortcuts for copying, pasting, and cutting text are `Ctrl+C`, `Ctrl+V`, and `Ctrl+X` respectively.)

### Selecting All Text

Same as the previous section, this button is probably useless. In the "Edit" menu you can find the "Select All" button. It works just like the keyboard shortcut for selecting all text (`Ctrl+A`).

### The Status Bar

The status bar below (which is hide-able, by the way) contains some information describing the current state of the file you're working on. It contains the filename, the changes status, the row and column, and the total size of the file.

### Running Your Code

If you have your code written in a supported language (Python, Node.js, or Ruby), you can run it directly from Prismblue. To do that, click on the "Run" button in the menu and then click on the "Run Code" button in the submenu. Note that your file must be saved before you can run it.

### Previewing Markdown and HTML Files

Additionally, you can preview your Markdown and HTML files in Prismblue. To do that, click on the "Run" button in the menu and then click on the "Preview Markdown/HTML" button in the submenu. After that a new mini-Prismblue window will open and you will be able to see your Markdown or HTML file rendered in it.

>[!TIP]
> The Markdown Renderer uses [Markdown-it](https://github.com/markdown-it/markdown-it) and the [Github Markdown CSS](https://github.com/sindresorhus/github-markdown-css) when previewing Markdown files so they'll look at least somewhat readable.

>[!NOTE]
> The HTML Previewer runs on the Electron backend, so it uses the same renderer as Chromium. This means that it will render your HTML file the same way as Chromium would.

## Acknowledgements

- [Electron](https://www.electronjs.org/)
- [Markdown-it](https://github.com/markdown-it/markdown-it)
- [Github Markdown CSS](https://github.com/sindresorhus/github-markdown-css)
- [Highlight.js](https://highlightjs.org/)
- [Font Awesome](https://fontawesome.com/)

## License

This project is licensed under the [GPL-3.0 License](LICENSE). Please comply with the license when using the project, if you need more information please review the [license](LICENSE) file.

## Contributing

Thank you very much for considering contributing to this project! Please read the [contributing guidelines](CONTRIBUTING.md) before doing so. If you have any questions, feel free to open an issue or contact me on Discord (`@lyubomirt`). However, I'm usually active on my [Discord Server](https://discord.gg/XkjPDcSfNz) so I believe I'll respond faster there.