<p align="center">
  <img src="assets/icon.png" alt="PlainRepo Logo" width="150"/>
</p>

<div align="center">
  <a href="https://plainrepo.com"><img alt="Homepage" src="https://img.shields.io/badge/🏠_Homepage-plainrepo.com-blue?style=flat-square"></a>
  <a href="https://github.com/rickkoh/plainrepo/actions/workflows/test.yml"><img alt="Build Status" src="https://img.shields.io/github/actions/workflow/status/rickkoh/plainrepo/test.yml?branch=main&style=flat-square&logo=github&label=main"></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-f5de53?style=flat-square&color=blue"></a>
  <a href="https://github.com/rickkoh/plainrepo/releases"><img alt="Latest Release" src="https://img.shields.io/github/v/release/rickkoh/plainrepo?style=flat-square&color=blue&label=latest%20release"></a>
</div>

# PlainRepo

PlainRepo is a desktop application that helps developers **select**, **view**, and **copy** the plain-text contents of any subset of files in a repository. It's perfect for feeding **precise context** to large language models (LLMs), debugging, refactoring, and general code analysis.

<p align="center">
  <img src="assets/appscreenshot.png" alt="PlainRepo Logo"/>
</p>

## Features

- **Selective File Inclusion** – Choose individual files or entire folders.
- **Plain Text Export** – Generate a single text file with all selected code.
- **Search & Filter** – Quickly find relevant files, text, or patterns.
- **Replace Sensitive Info** – Easily sanitize code before sharing.
- **One-Click Copy** – Send your curated code context to any AI tool.
- **Optimised Performance** – Handle reading thousands of files.

## Getting Started

1. **Clone the Repository**

   ```bash
   git clone https://github.com/rickkoh/plainrepo.git
   cd plainrepo
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start the App (Development Mode)**

   ```bash
   npm run start
   ```

   This runs both the Electron main and React renderer in development mode.

4. **Build for Production**
   ```bash
   npm run package
   ```
   This packages the app for distribution on your current operating system.

## Contributing

We welcome contributions to PlainRepo! Please see our [Code of Conduct](./CODE_OF_CONDUCT.md) for guidelines on how to participate respectfully in our community.

## Maintainers

- [Rick Koh](https://github.com/rickkoh)

## License

This project is licensed under the [MIT License](./LICENSE).

## Acknowledgments

- Based on [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate).
- Created & Maintained by [Rick Koh](mailto:rick.kohjiaxuan@gmail.com).
