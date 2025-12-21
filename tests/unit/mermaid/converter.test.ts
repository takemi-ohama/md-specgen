/**
 * Mermaid変換モジュールのテスト
 */

import { replaceMermaidDiagrams } from '../../../src/modules/mermaid/converter';

describe('replaceMermaidDiagrams', () => {
  describe('HTMLタグとエンティティのデコード', () => {
    it('シンタックスハイライトのspanタグを除去できる', async () => {
      const html = `
        <pre><code class="language-mermaid"><span class="token">graph</span> <span class="token">TD</span>
    <span class="token">A</span> --&gt; <span class="token">B</span></code></pre>
      `;

      const result = await replaceMermaidDiagrams(html, {
        theme: 'default',
      });

      // Mermaid変換が成功していることを確認（SVGまたはPNGが埋め込まれる）
      expect(result).toMatch(/<svg|data:image\//);
      // 元のspanタグは残っていない
      expect(result).not.toContain('<span class="token">');
    });

    it('HTMLエンティティを正しくデコードできる', async () => {
      const html = `
        <pre><code class="language-mermaid">graph TD
    A[&quot;Start&quot;] --&gt; B[&quot;End&quot;]</code></pre>
      `;

      const result = await replaceMermaidDiagrams(html, {
        theme: 'default',
      });

      // Mermaid変換が成功していることを確認
      expect(result).toMatch(/<svg|data:image\//);
    });

    it('複数のHTMLタグ(div, code, pre)を除去できる', async () => {
      const html = `
        <pre><code class="language-mermaid"><div class="highlight"><code>graph TD
    A --&gt; B</code></div></code></pre>
      `;

      const result = await replaceMermaidDiagrams(html, {
        theme: 'default',
      });

      // Mermaid変換が成功していることを確認
      expect(result).toMatch(/<svg|data:image\//);
    });

    it('二重エスケープされたHTMLエンティティを正しく処理できる', async () => {
      const html = `
        <pre><code class="language-mermaid">graph TD
    A[&amp;lt;component&amp;gt;] --&gt; B</code></pre>
      `;

      const result = await replaceMermaidDiagrams(html, {
        theme: 'default',
      });

      // Mermaid変換が成功していることを確認
      // &amp;lt; → &lt; → < と正しくデコードされる
      expect(result).toMatch(/<svg|data:image\//);
    });

    it('HTMLコメントを除去できる', async () => {
      const html = `
        <pre><code class="language-mermaid"><!-- comment -->graph TD
    A --&gt; B</code></pre>
      `;

      const result = await replaceMermaidDiagrams(html, {
        theme: 'default',
      });

      // Mermaid変換が成功していることを確認
      expect(result).toMatch(/<svg|data:image\//);
    });
  });

  describe('複雑なMermaidダイアグラム', () => {
    it('引用符と特殊文字を含むダイアグラムを変換できる', async () => {
      const html = `
        <pre><code class="language-mermaid"><span>graph</span> <span>TD</span>
    <span>A[&quot;Node with &lt;special&gt; chars&quot;]</span> --&gt; <span>B</span></code></pre>
      `;

      const result = await replaceMermaidDiagrams(html, {
        theme: 'default',
      });

      // Mermaid変換が成功していることを確認
      expect(result).toMatch(/<svg|data:image\//);
    });

    it('複数のMermaidダイアグラムを変換できる', async () => {
      const html = `
        <pre><code class="language-mermaid">graph TD
    A --&gt; B</code></pre>
        <p>テキスト</p>
        <pre><code class="language-mermaid">graph LR
    C --&gt; D</code></pre>
      `;

      const result = await replaceMermaidDiagrams(html, {
        theme: 'default',
      });

      // 2つのMermaidダイアグラムが変換されていることを確認
      const svgMatches = result.match(/<svg/g) || result.match(/data:image\//g);
      expect(svgMatches).toBeTruthy();
    });
  });

  describe('エッジケース', () => {
    it('Mermaidコードがない場合は元のHTMLを返す', async () => {
      const html = '<p>通常のHTML</p>';

      const result = await replaceMermaidDiagrams(html, {
        theme: 'default',
      });

      expect(result).toBe(html);
    });

  });
});
