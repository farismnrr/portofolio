import type { Theme } from './theme';

type MermaidDiagramType = 'flowchart' | 'sequence' | 'state' | 'er' | 'journey' | 'mindmap' | 'class' | 'generic';

function diagramType(source: string): MermaidDiagramType {
  const firstLine = source.trimStart().split(/\r?\n/, 1)[0]?.trim().toLowerCase() ?? '';
  if (firstLine.startsWith('sequencediagram')) return 'sequence';
  if (firstLine.startsWith('statediagram')) return 'state';
  if (firstLine.startsWith('erdiagram')) return 'er';
  if (firstLine.startsWith('journey')) return 'journey';
  if (firstLine.startsWith('mindmap')) return 'mindmap';
  if (firstLine.startsWith('classdiagram')) return 'class';
  if (firstLine.startsWith('flowchart') || firstLine.startsWith('graph')) return 'flowchart';
  return 'generic';
}

function variables(theme: Theme) {
  const dark = theme === 'dark';
  const background = dark ? '#111311' : '#f8f8f6';
  const surface = dark ? '#20251f' : '#eef1eb';
  const surfaceStrong = dark ? '#293028' : '#ffffff';
  const surfaceMuted = dark ? '#191d19' : '#f4f5f2';
  const text = dark ? '#f1f2ed' : '#20211f';
  const line = dark ? '#a9b4a6' : '#667063';
  const border = dark ? '#667164' : '#c3cbc0';
  const accent = dark ? '#b8cbb4' : '#344534';

  return {
    background,
    primaryColor: surface,
    primaryTextColor: text,
    primaryBorderColor: border,
    secondaryColor: surfaceMuted,
    tertiaryColor: surfaceStrong,
    textColor: text,
    lineColor: line,
    mainBkg: surface,
    secondBkg: surfaceMuted,
    nodeBorder: border,
    nodeTextColor: text,
    clusterBkg: surfaceMuted,
    clusterBorder: border,
    defaultLinkColor: line,
    titleColor: text,
    edgeLabelBackground: background,
    arrowheadColor: line,

    actorBorder: border,
    actorBkg: surface,
    actorTextColor: text,
    actorLineColor: line,
    signalColor: line,
    signalTextColor: text,
    labelBoxBkgColor: surfaceMuted,
    labelBoxBorderColor: border,
    labelTextColor: text,
    loopTextColor: text,
    noteBorderColor: border,
    noteBkgColor: surfaceStrong,
    noteTextColor: text,
    activationBorderColor: border,
    activationBkgColor: surfaceMuted,
    sequenceNumberColor: background,

    labelColor: text,
    altBackground: surfaceMuted,
    compositeBackground: surface,
    compositeBorder: border,
    compositeTitleBackground: surfaceStrong,
    innerEndBackground: accent,
    specialStateColor: accent,

    entityBackground: surface,
    entityBorder: border,
    entityLabelColor: text,
    relationshipLabelColor: text,
    relationshipColor: line,
    attributeBackgroundColor: surfaceMuted,

    classText: text,
    fillType0: surface,
    fillType1: surfaceMuted,
    fillType2: surfaceStrong,
    fillType3: surface,
    fillType4: surfaceMuted,
    fillType5: surfaceStrong,
    fillType6: surface,
    fillType7: surfaceMuted
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
    htmlLabels: true,
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    themeVariables: variables(theme),
    flowchart: {
      useMaxWidth: false,
      wrappingWidth: 180,
      minNodeWidth: 120
    },
    sequence: {
      useMaxWidth: false,
      wrap: true
    }
  });

  for (const node of nodes) {
    if (!node.dataset.mermaidSource) node.dataset.mermaidSource = node.textContent ?? '';
    const shell = node.closest<HTMLElement>('.mermaid-shell');
    if (shell) shell.dataset.diagramType = diagramType(node.dataset.mermaidSource);
    node.removeAttribute('data-processed');
    node.textContent = node.dataset.mermaidSource;
  }

  await mermaid.run({ nodes });
}
