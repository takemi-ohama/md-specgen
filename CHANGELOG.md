# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

[日本語版 CHANGELOG (Japanese)](./CHANGELOG.ja.md)

## [1.1.0] - 2025-12-16

### Added

- **PDF Generation Options**:
  - `--no-toc`: Option to skip table of contents generation
  - `--font`: Custom font specification for PDF output (default: Noto Sans JP)
  - `--toc-level`: Configurable table of contents depth level
  - Dynamic Google Fonts loading support

### Improved

- **PDF Styling**:
  - Enhanced table borders and background colors
  - Japanese font support (Noto Sans JP integration)
  - SVG scaling improvements (prevent enlargement, allow shrinking only)

- **Mermaid Diagram Rendering**:
  - Font size optimization
  - Width constraints for better layout

- **File Processing**:
  - Natural sorting for numbered file prefixes
  - Markdown line break preservation in HTML output (`breaks: true`)
  - Fixed HTML output path structure (html/html/ → html/)

- **Stability**:
  - Proper Puppeteer browser cleanup and resource management

## [1.0.0] - 2024-12-14

### 🎉 Initial Release

First stable release of md-specgen.

### Added Features

#### Core Features
- **Markdown Parser**: Front-matter compatible Markdown parser
- **HTML Conversion**: Customizable HTML template generation
- **PDF Generation**: Puppeteer-based PDF output (header/footer support)
- **Image Processing**:
  - Base64 embedding
  - Security scanning
  - Automatic external image downloading

#### AI Features
- **LLM Provider Integration**:
  - Claude (Anthropic API)
  - AWS Bedrock (Claude on AWS)
- **AI-Assisted Features**:
  - Document enhancement
  - Content generation
  - Quality improvement suggestions

#### Developer Features
- **Full TypeScript Support**: Type definition files included
- **Flexible Configuration**: YAML-based configuration files
- **Extensible Architecture**: Plugin-capable design
- **Security Focus**: Input validation, path validation, image scanning

#### Tools
- **CLI**: `md-specgen` command-line interface
- **Logging**: Structured logging with spinner support
- **Error Handling**: Detailed error messages

### Documentation
- Comprehensive README (examples, configuration, API specifications)
- TypeScript type definitions
- Sample projects

### Testing
- Jest integrated testing environment
- 178 test cases
- Coverage of major features

### Technology Stack
- **Language**: TypeScript 5.7
- **Runtime**: Node.js >= 18.0.0
- **Major Libraries**:
  - marked 15.0 (Markdown parser)
  - puppeteer 23.11 (PDF generation)
  - @anthropic-ai/sdk 0.38 (Claude AI)
  - @aws-sdk/client-bedrock-runtime 3.712 (AWS Bedrock)

[1.0.0]: https://github.com/takemi-ohama/md-specgen/releases/tag/v1.0.0
