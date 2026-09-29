let initialized = false;

export async function renderMermaid(root: HTMLElement) {
  const nodes = root.querySelectorAll<HTMLElement>('.mermaid');
  if (!nodes.length) return;
  const { default: mermaid } = await import('mermaid');
  if (!initialized) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      themeVariables: {
        background: '#f8f8f6', primaryColor: '#eef1eb', primaryTextColor: '#20211f',
        primaryBorderColor: '#cfd4cc', lineColor: '#667063', secondaryColor: '#f4f5f2', tertiaryColor: '#ffffff'
      }
    });
    initialized = true;
  }
  await mermaid.run({ nodes });
}
