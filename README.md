# md-specgen

[![npm version](https://img.shields.io/npm/v/md-specgen.svg)](https://www.npmjs.com/package/md-specgen)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

A flexible Markdown documentation generator with HTML/PDF output and AI-powered enhancements.

[日本語版 README (Japanese)](./README.ja.md)

## Features

- 📝 **Markdown to HTML/PDF**: Convert Markdown files to beautiful HTML or PDF documents
- 🎨 **NumPy-style Theme**: Clean and sophisticated default template
- 📄 **Advanced PDF Options**: Page orientation, custom margins, headers/footers
- 📦 **Custom Containers**: Visual callouts for warnings, info, tips, and more (:::warning, :::info, :::tip, etc.)
- 📊 **Mermaid Support**: Automatically convert Mermaid diagrams to SVG images
- 🎯 **PlantUML Support**: Convert PlantUML diagrams to PNG/SVG via official server
- 👀 **Watch Mode**: Automatically regenerate on file changes
- 🖼️ **Image Embedding**: Base64 encoding allows single-file output
- 📎 **File Include**: Include external files in your markdown
- 🔗 **Auto Anchors**: Automatic heading anchor links with markdown-it-anchor
- 🔒 **Security**: Image path validation prevents path traversal attacks
- 🤖 **AI Features** (Optional): Quality checks and auto-generation using Claude API
- ⚙️ **Flexible Configuration**: Customizable via JSON/YAML configuration files

## Installation

### From NPM

```bash
npm install -g md-specgen
```

### Add to Local Project

```bash
npm install --save-dev md-specgen
```

## Quick Start

### CLI Usage

Simplest usage:

```bash
# Generate HTML from Markdown directory
md-specgen --input ./docs --output ./output

# Or generate from a single Markdown file
md-specgen --input ./docs/README.md --output ./output
```

With images:

```bash
md-specgen --input ./docs --output ./output --images ./images
```

With PDF generation:

```bash
md-specgen --input ./docs --output ./output --pdf --format A4
```

### Using Configuration File

Create `md-specgen.config.json` at project root:

```json
{
  "inputDir": "./docs",
  "outputDir": "./output",
  "imagesDir": "./images",
  "html": {
    "breadcrumbs": true,
    "footerText": "© 2024 My Company"
  },
  "pdf": {
    "enabled": true,
    "format": "A4",
    "orientation": "portrait",
    "margin": {
      "top": "30mm",
      "bottom": "30mm",
      "left": "25mm",
      "right": "25mm"
    },
    "displayHeaderFooter": true,
    "headerTemplate": "<div style=\"font-size: 9px; text-align: center; width: 100%;\"><span class=\"title\"></span></div>",
    "footerTemplate": "<div style=\"font-size: 9px; text-align: center; width: 100%; color: #666;\"><span class=\"pageNumber\"></span> / <span class=\"totalPages\"></span></div>",
    "includeToc": true,
    "includeCover": true,
    "coverTitle": "Project Requirements Specification",
    "coverSubtitle": "Version 1.0"
  },
  "mermaid": {
    "enabled": true,
    "theme": "default"
  },
  "images": {
    "embed": true
  }
}
```

Run with configuration file:

```bash
md-specgen --config md-specgen.config.json
```

## CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--input, -i` | Directory or file path containing Markdown files | `./markdown` |
| `--output, -o` | Output directory | `./output` |
| `--images` | Images directory | `./images` |
| `--config, -c` | Configuration file path | - |
| `--pdf` | Enable PDF output | `false` |
| `--format` | PDF paper size (A4/A3/Letter/Legal) | `A4` |
| `--watch, -w` | Watch for file changes and automatically regenerate | `false` |
| `--llm` | Enable LLM features | `false` |
| `--llm-provider` | LLM provider (anthropic/bedrock) | `anthropic` |
| `--llm-quality-check` | LLM quality check | `false` |
| `--llm-auto-index` | Auto-generate index | `false` |
| `--llm-auto-frontmatter` | Auto-generate frontmatter | `false` |
| `--llm-auto-image-alt` | Auto-generate image alt attributes | `false` |

## Programmable API

Use from TypeScript/JavaScript:

```typescript
import { generate, loadConfig, getDefaultConfig } from 'md-specgen';

// Run with configuration file
const config = await loadConfig('./md-specgen.config.json');
await generate(config);

// Build configuration in code
const customConfig = {
  inputDir: './docs',
  outputDir: './build',
  imagesDir: './images',
  html: {
    breadcrumbs: true,
    footerText: '© 2024 Example Corp'
  },
  pdf: {
    enabled: true,
    format: 'A4' as const,
  }
};
await generate(customConfig);

// Get default config and customize
const defaultConfig = getDefaultConfig();
const myConfig = {
  ...defaultConfig,
  inputDir: './my-docs',
  outputDir: './my-output',
};
await generate(myConfig);
```

## Configuration File

Both JSON format (`md-specgen.config.json`) and YAML format (`md-specgen.config.yaml`) are supported.

### JSON Example

```json
{
  "inputDir": "./markdown",
  "outputDir": "./output",
  "imagesDir": "./images",
  "html": {
    "template": "./custom-template.html",
    "breadcrumbs": true,
    "footerText": "© 2024 My Company"
  },
  "pdf": {
    "enabled": false,
    "format": "A4",
    "orientation": "portrait",
    "margin": {
      "top": "25mm",
      "bottom": "25mm",
      "left": "20mm",
      "right": "20mm"
    },
    "displayHeaderFooter": false,
    "headerTemplate": "",
    "footerTemplate": "",
    "includeToc": true,
    "includeCover": true,
    "coverTitle": "Document Title",
    "coverSubtitle": "Subtitle"
  },
  "mermaid": {
    "enabled": true,
    "theme": "default"
  },
  "images": {
    "embed": true
  },
  "llm": {
    "enabled": false,
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "apiKey": "your-api-key",
    "qualityCheck": false,
    "autoIndex": false,
    "autoFrontmatter": false,
    "autoImageAlt": false
  }
}
```

### YAML Example

```yaml
inputDir: ./markdown
outputDir: ./output
imagesDir: ./images

html:
  breadcrumbs: true
  footerText: "© 2024 My Company"

pdf:
  enabled: false
  format: A4
  orientation: portrait
  margin:
    top: 25mm
    bottom: 25mm
    left: 20mm
    right: 20mm
  displayHeaderFooter: false
  includeToc: true
  includeCover: true

mermaid:
  enabled: true
  theme: default

images:
  embed: true
```

## LLM Features (Optional)

Advanced features using Claude API.

### Environment Variables

```bash
# When using Anthropic API
export ANTHROPIC_API_KEY="your-api-key"

# When using AWS Bedrock
export AWS_REGION="us-west-2"
```

### LLM Features List

- **Quality Check**: Verify document quality, consistency, and completeness
- **Auto Index**: Automatically generate table of contents
- **Auto Frontmatter**: Automatically generate metadata
- **Auto Image Alt**: Automatically generate image alt text (improves accessibility)

```bash
# Enable all LLM features
md-specgen --input ./docs --output ./output \
  --llm \
  --llm-quality-check \
  --llm-auto-index \
  --llm-auto-frontmatter \
  --llm-auto-image-alt
```

## Directory Structure

```
md-specgen/
├── src/                    # Source code
│   ├── cli/                # CLI interface
│   ├── core/               # Core engine
│   │   ├── config.ts       # Configuration management
│   │   ├── generator.ts    # Main generator
│   │   └── types.ts        # Type definitions
│   ├── modules/            # Feature modules
│   │   ├── markdown/       # Markdown processing
│   │   ├── html/           # HTML generation
│   │   ├── pdf/            # PDF generation
│   │   ├── mermaid/        # Mermaid processing
│   │   ├── image/          # Image processing
│   │   └── llm/            # LLM integration
│   └── utils/              # Utilities
├── tests/                  # Tests
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test data
├── examples/               # Sample projects
└── docs/                   # Documentation
    └── API.md              # API detailed documentation
```

## Development

### Development Environment

- Node.js >= 18.0.0
- TypeScript 5.7.2
- Jest (testing framework)

### Development Commands

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode (watch)
npm run dev

# Run tests
npm test

# Test coverage
npm run test:coverage

# Lint
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format
npm run format
```

### Testing

```bash
# Run all tests
npm test

# Generate coverage report
npm run test:coverage

# Run specific test file only
npm test -- tests/unit/html/converter.test.ts
```

## Sample Project

A sample project is available in the `examples/basic/` directory.

```bash
cd examples/basic
md-specgen --config md-specgen.config.json
```

## API Documentation

For detailed API specifications, see [docs/API.md](./docs/API.md).

## License

MIT License - Copyright (c) 2025 takemi-ohama

See [LICENSE](./LICENSE) file for details.

## Acknowledgments

This project was inspired by and incorporates ideas from the following excellent projects:

- [vscode-markdown-pdf](https://github.com/yzane/vscode-markdown-pdf) by yzane
  - PDF header/footer customization
  - Page orientation and margin settings
  - Extended markdown-it plugins support

We are grateful for their contributions to the Markdown ecosystem.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

### Contribution Guidelines

- Match code style to existing code
- Always add tests for new features
- Write clear commit messages
- Don't forget to update documentation

## Support

- 🐛 Bug Reports: [GitHub Issues](https://github.com/takemi-ohama/md-specgen/issues)
- 💬 Questions/Discussion: [GitHub Discussions](https://github.com/takemi-ohama/md-specgen/discussions)
- 📧 Email: [takemi.ohama@example.com](mailto:takemi.ohama@example.com)

## Changelog

### v2.0.0 (2025-01-XX)

- **New**: Watch mode - automatically regenerate on file changes (`--watch` option)
- **Enhancement**: Improved development workflow with automatic regeneration
- **Enhancement**: Graceful shutdown handling for watch mode

### v1.4.0 (2025-01-XX)

- **Breaking**: Migrated from `marked` to `markdown-it` for better plugin ecosystem support
- **New**: PlantUML diagram support (PNG/SVG output via official server)
- **New**: Custom container support (:::warning, :::info, :::tip, :::danger, :::note, :::success)
- **New**: File include functionality with markdown-it-include
- **New**: Automatic heading anchors with markdown-it-anchor
- **Enhancement**: Enhanced Markdown processing capabilities
- **Enhancement**: Improved extensibility with markdown-it plugin system

### v1.3.0 (2025-01-XX)

- **New**: Advanced PDF options - page orientation (portrait/landscape)
- **New**: Custom PDF margins (top, bottom, left, right)
- **New**: PDF headers and footers with template support
- **Enhancement**: More flexible PDF customization options

### v1.0.0 (2025-01-XX)

- Initial release
- Markdown to HTML/PDF conversion
- Automatic Mermaid diagram rendering
- Image Base64 embedding
- LLM features (optional)
- CLI/Programmable API

## Related Projects

- [marked](https://github.com/markedjs/marked) - Markdown parser
- [puppeteer](https://github.com/puppeteer/puppeteer) - PDF generation
- [mermaid](https://github.com/mermaid-js/mermaid) - Diagram generation

## Credits

This project uses the following open source projects:

- TypeScript
- Jest
- ESLint
- Prettier
- Many others (see package.json)

---

Made with ❤️ by [takemi-ohama](https://github.com/takemi-ohama)
