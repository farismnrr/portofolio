import type { Theme } from './theme';

type MermaidDiagramType = 'flowchart' | 'sequence' | 'state' | 'er' | 'journey' | 'mindmap' | 'class' | 'generic';

function diagramType(source: string): MermaidDiagramType {
  const firstLine = source.trimStart().split(/\r?\n/, 1)[0]?.trim().toLowerCase() ?? '';
  if (firstLine.startsWith('sequenceDiagram'.toLowerCase())) return 'sequence';
  if (firstLine.startsWith('stateDiagram'.toLowerCase())) return 'state';
  if (firstLine.startsWith('erDiagram'.toLowerCase())) return 'er';
  if (firstLine.startsWith('journey')) return 'journey';
  if (firstLine.startsWith('mindmap')) return 'mindmap';
  if (firstLine.startsWith('classDiagram'.toLowerCase())) return 'class';
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

function readViewBox(svg: SVGSVGElement) {
  const base = svg.viewBox?.baseVal;
  if (base?.width && base?.height) return { width: base.width, height: base.height };

  const raw = svg.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
  if (raw?.length === 4 && raw.every(Number.isFinite) && raw[2] > 0 && raw[3] > 0) {
    return { width: raw[2], height: raw[3] };
  }

  const width = Number.parseFloat(svg.getAttribute('width') ?? '0');
  const height = Number.parseFloat(svg.getAttribute('height') ?? '0');
  return { width, height };
}

function readableMinWidth(type: MermaidDiagramType, width: number, height: number) {
  const ratio = width > 0 && height > 0 ? width / height : 1;
  const naturallyWide = ratio >= 2.15 || type === 'sequence' || type === 'journey';
  if (!naturallyWide) return 0;

  const ratioDriven = Math.round(ratio * 230);
  const typeFloor = type === 'sequence' || type === 'journey' ? 920 : 820;
  return Math.min(1600, Math.max(typeFloor, ratioDriven));
}

function applyPresentation(node: HTMLElement) {
  const source = node.dataset.mermaidSource ?? node.textContent ?? '';
  const type = diagramType(source);
  const shell = node.closest<HTMLElement>('.mermaid-shell');
  const svg = node.querySelector<SVGSVGElement>('svg');
  if (!shell || !svg) return;

  const { width, height } = readViewBox(svg);
  const minWidth = readableMinWidth(type, width, height);

  shell.dataset.diagramType = type;
  shell.dataset.diagramLayout = minWidth > 0 ? 'wide' : 'compact';
  shell.style.setProperty('--mermaid-min-width', `${minWidth}px`);
  svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
  svg.removeAttribute('height');
  svg.removeAttribute('width');
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
    const shell = node.closest<HTMLElement>('.mermaid-shell');
    if (shell) {
      shell.dataset.diagramType = diagramType(node.dataset.mermaidSource);
      shell.removeAttribute('data-diagram-layout');
      shell.style.removeProperty('--mermaid-min-width');
    }
    node.removeAttribute('data-processed');
    node.textContent = node.dataset.mermaidSource;
  }

  await mermaid.run({ nodes });
  for (const node of nodes) applyPresentation(node);
}
