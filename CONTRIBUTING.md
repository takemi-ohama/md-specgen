# Contributing Guide

Thank you for considering contributing to md-specgen!
This document explains how to contribute to the project.

[日本語版 CONTRIBUTING (Japanese)](./CONTRIBUTING.ja.md)

## 🤝 How to Contribute

### Bug Reports

If you find a bug, please report it following these steps:

1. Check [existing Issues](https://github.com/takemi-ohama/md-specgen/issues) to see if the same problem has been reported
2. Create a new Issue using the "Bug Report" template
3. Include the following information:
   - Clear title and description
   - Steps to reproduce
   - Expected behavior vs actual behavior
   - Environment information (OS, Node.js version, md-specgen version)
   - Screenshots or error logs if possible

### Feature Requests

New feature proposals are very welcome:

1. Check [existing Issues](https://github.com/takemi-ohama/md-specgen/issues) for similar proposals
2. Create an Issue using the "Feature Request" template
3. Clearly explain:
   - The problem you want to solve
   - Your proposed solution
   - Alternative approaches (if any)

### Pull Requests

Steps for code contributions:

1. **Fork the repository**
   ```bash
   gh repo fork takemi-ohama/md-specgen
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Set up development environment**
   ```bash
   npm install
   npm run build
   npm test
   ```

4. **Implement changes**
   - Follow code style guide (see below)
   - Add appropriate tests
   - Update documentation

5. **Test and lint**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

6. **Commit**
   ```bash
   git add .
   git commit -m "feat: description of new feature"
   ```

   Commit message conventions:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes only
   - `style:` - Changes that don't affect code meaning
   - `refactor:` - Refactoring
   - `test:` - Adding/modifying tests
   - `chore:` - Build process or tool changes

7. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

   Then create a PR on GitHub and fill in the template

## 📝 Code Style Guide

### TypeScript

- **Format**: Use Prettier (settings in `.prettierrc`)
- **Lint**: Use ESLint (settings in `.eslintrc.json`)
- **Types**: Use explicit types whenever possible, avoid `any`

```typescript
// ✅ Good
export async function generatePdf(options: PdfOptions): Promise<string> {
  // ...
}

// ❌ Bad
export async function generatePdf(options: any): Promise<any> {
  // ...
}
```

### File Structure

```
src/
├── core/          # Core logic
├── cli/           # CLI interface
├── markdown/      # Markdown parser
├── html/          # HTML conversion
├── pdf/           # PDF generation
├── image/         # Image processing
├── llm/           # AI features
└── utils/         # Utilities
```

### Testing

- **Unit tests**: Place in `tests/unit/`
- **Integration tests**: Place in `tests/integration/`
- **Coverage**: Cover new features with appropriate tests

```typescript
// Test file example: tests/unit/markdown/parser.test.ts
describe('MarkdownParser', () => {
  describe('parse', () => {
    it('should parse markdown with frontmatter', () => {
      // Test code
    });
  });
});
```

### Documentation

- **TSDoc**: Always add TSDoc comments to public APIs
- **README**: Add examples to README for new features
- **CHANGELOG**: Update on release

```typescript
/**
 * Parses Markdown files and converts them to HTML
 *
 * @param content - Markdown content
 * @param options - Conversion options
 * @returns Converted HTML
 * @throws {ValidationError} On invalid input
 *
 * @example
 * ```typescript
 * const html = await parseMarkdown(content, { sanitize: true });
 * ```
 */
export async function parseMarkdown(
  content: string,
  options?: ParseOptions
): Promise<string> {
  // ...
}
```

## 🔍 Development Tips

### Local Testing

```bash
# Build
npm run build

# Test local CLI
node dist/cli/index.js generate examples/basic/input.md

# Watch mode
npm run dev
```

### Debugging

```bash
# Enable debug logs
DEBUG=md-specgen:* npm test
```

### Performance Testing

```bash
# Test with large files
npm run test:performance
```

## 📋 Review Process

1. When a PR is created, CI runs automatically
2. All tests must pass
3. Maintainers will perform code review
4. We may request modifications if needed
5. After approval, maintainers will merge

## 🎯 Priority Areas

We especially welcome contributions in these areas:

- [ ] Performance optimization
- [ ] Additional LLM provider support
- [ ] Documentation improvements
- [ ] Test coverage improvements
- [ ] Internationalization (i18n) support
- [ ] Plugin system extensions

## 📜 License

Contributed code will be published under the same [MIT License](LICENSE) as the project.

## 💬 Questions & Consultation

- **Questions**: Use [GitHub Discussions](https://github.com/takemi-ohama/md-specgen/discussions)
- **Bug Reports**: Use [GitHub Issues](https://github.com/takemi-ohama/md-specgen/issues)
- **Security Issues**: Contact maintainers directly instead of opening public Issues

## 🙏 Acknowledgments

Thank you so much for considering contributing to md-specgen!
Your contributions make this project better.
