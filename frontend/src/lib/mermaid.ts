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
    theme: 'base',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    themeVariables: variables(theme)
  });

  for (const node of nodes) {
    if (!node.dataset.mermaidSource) node.dataset.mermaidSource = node.textContent ?? '';
    node.removeAttribute('data-processed');
    node.textContent = node.dataset.mermaidSource;
  }

  await mermaid.run({ nodes });
}
