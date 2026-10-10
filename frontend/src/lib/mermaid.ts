import type { Theme } from './theme';

function variables(theme: Theme) {
  return theme === 'dark'
    ? {
        background: '#111311',
        primaryColor: '#20251f',
        primaryTextColor: '#f1f2ed',
        primaryBorderColor: '#596258',
        lineColor: '#a3ada0',
        secondaryColor: '#191d19',
        tertiaryColor: '#252b24',
        textColor: '#f1f2ed',
        mainBkg: '#20251f',
        nodeBorder: '#596258'
      }
    : {
        background: '#f8f8f6',
        primaryColor: '#eef1eb',
        primaryTextColor: '#20211f',
        primaryBorderColor: '#cfd4cc',
        lineColor: '#667063',
        secondaryColor: '#f4f5f2',
        tertiaryColor: '#ffffff',
        textColor: '#20211f',
        mainBkg: '#eef1eb',
        nodeBorder: '#cfd4cc'
      };
}

export async function renderMermaid(root: HTMLElement, theme: Theme) {
  const nodes = [...root.querySelectorAll<HTMLElement>('.mermaid')];
  if (!nodes.length) return;

  const mermaidUrl = '/vendor/mermaid.esm.min.mjs';
  const { default: mermaid } = await import(/* @vite-ignore */ mermaidUrl);
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    // SVG labels measure in diagram coordinates rather than browser pixels.
    // HTML foreignObject labels can mismeasure under display scaling.
    htmlLabels: false,
    theme: 'base',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    themeVariables: variables(theme)
  });

  await document.fonts.ready;

  for (const node of nodes) {
    if (!node.dataset.mermaidSource) node.dataset.mermaidSource = node.textContent ?? '';
    node.removeAttribute('data-processed');
    // Stack horizontal flowcharts in narrow article columns so fitting the
    // SVG does not turn a long row of nodes into a tiny mobile thumbnail.
    node.textContent = root.clientWidth < 640
      ? node.dataset.mermaidSource.replace(/^(\s*(?:flowchart|graph)\s+)(?:LR|RL)\b/m, '$1TB')
      : node.dataset.mermaidSource;
  }

  await mermaid.run({ nodes });

  for (const node of nodes) {
    const svg = node.querySelector('svg');
    if (!svg) continue;
    const { width, height } = svg.viewBox.baseVal;
    // Reserve the full diagram height in normal document flow, including
    // when the layout changes from a horizontal row to a vertical flow.
    if (width > 0 && height > 0) node.style.aspectRatio = `${width} / ${height}`;
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.maxWidth = 'none';
    svg.style.minWidth = '0';
    svg.style.display = 'block';
  }
}
