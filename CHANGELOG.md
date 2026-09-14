# 1.0.2 (2026-09-15)

#### Bug Fixes

- **Windows builds** – Windows installers are now built and published with every release. Previous releases only included macOS builds.
- **macOS "damaged" error** – macOS builds are now signed correctly, so downloaded apps can be opened on Apple Silicon Macs.
- **Reset button** – The reset button now clears the selection.
- **Exclude patterns** – File watching now applies exclude patterns correctly, including on Windows.
- **Unreadable files and folders** – Protected folders and files locked by other programs no longer crash the app.
- **Copy limit** – Copying more than the default copy limit now shows a message instead of failing silently.
- **File watching** – Re-selecting a folder no longer leaks file watchers.
- **Updates** – Failed update checks are handled gracefully.

# 1.0.1 (2025-05-17)

#### Features

- **File watch** - Watch for file changes and update the file contents in real-time.
- **Performance improvements** - Improve the performance of the app using file discovery techniques.
- **Bug fixes** - Fix some bugs.

# 1.0.0 (2025-02-20)

#### Features

- **Selective File Inclusion** – Choose individual files or entire folders.
- **Plain Text Export** – Generate a single text file with all selected code.
- **Search & Filter** – Quickly find relevant files, text, or patterns.
- **Replace Sensitive Info** – Easily sanitize code before sharing.
- **Multiple Tabs** – Keep different sets of files or contexts organized.
- **One-Click Copy** – Send your curated code context to any AI tool.
