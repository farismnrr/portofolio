import {
  siActix,
  siAndroid,
  siBun,
  siCapacitor,
  siDocker,
  siExpress,
  siFastapi,
  siFirebase,
  siGin,
  siGithub,
  siGithubactions,
  siGo,
  siGooglecloud,
  siHtml5,
  siJavascript,
  siJsonwebtokens,
  siKeras,
  siKotlin,
  siLanggraph,
  siMarkdown,
  siMermaid,
  siMqtt,
  siMysql,
  siModelcontextprotocol,
  siNginx,
  siNodedotjs,
  siNuxt,
  siOllama,
  siOpentelemetry,
  siPostgresql,
  siPrometheus,
  siPython,
  siRedis,
  siReact,
  siRocksdb,
  siRust,
  siSass,
  siSqlite,
  siSvelte,
  siTensorflow,
  siTypescript,
  siVite,
  siTailwindcss,
  siVuedotjs,
  siNestjs,
  siDrizzle,
  siTimescale,
  siTauri,
  siDaisyui,
  siCodemirror,
  siClaude,
  siMongodb,
  siEclipsemosquitto,
  siZigbee2mqtt,
  type SimpleIcon
} from 'simple-icons';

type TechIcon = Partial<Pick<SimpleIcon, 'path'>> & {
  custom?: boolean;
  assetSrc?: string;
  strokePaths?: string[];
};

const iconEntries: Array<[string, TechIcon]> = [
  ['rust', siRust], ['actix web', siActix], ['postgresql', siPostgresql],
  ['sql', {
    path: 'M12 3c-4.42 0-8 1.34-8 3v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6c0-1.66-3.58-3-8-3'
      + 'm-8 3c0 1.66 3.58 3 8 3s8-1.34 8-3m-16 6c0 1.66 3.58 3 8 3s8-1.34 8-3'
  }],
  ['mysql', siMysql], ['mongodb', siMongodb], ['sqlite', siSqlite], ['rocksdb', siRocksdb], ['go', siGo],
  ['svelte', siSvelte], ['sveltekit', siSvelte], ['typescript', siTypescript],
  ['javascript', siJavascript], ['vue', siVuedotjs], ['nuxt', siNuxt], ['bun', siBun],
  ['node.js', siNodedotjs], ['nodejs', siNodedotjs], ['express', siExpress],
  ['docker', siDocker], ['nginx', siNginx], ['redis', siRedis], ['mqtt', siMqtt],
  ['opentelemetry', siOpentelemetry], ['prometheus', siPrometheus], ['kotlin', siKotlin],
  ['react', siReact], ['tailwind css', siTailwindcss], ['nestjs', siNestjs],
  ['drizzle orm', siDrizzle], ['timescaledb', siTimescale],
  ['daisyui', siDaisyui],
  ['codemirror', siCodemirror], ['claude code', siClaude],
  ['openai codex', {
    strokePaths: [
      'M11.217 19.384a3.501 3.501 0 0 0 6.783 -1.217v-5.167l-6 -3.35',
      'M5.214 15.014a3.501 3.501 0 0 0 4.446 5.266l4.34 -2.534v-6.946',
      'M6 7.63c-1.391 -.236 -2.787 .395 -3.534 1.689a3.474 3.474 0 0 0 1.271 4.745l4.263 2.514l6 -3.348',
      'M12.783 4.616a3.501 3.501 0 0 0 -6.783 1.217v5.067l6 3.45',
      'M18.786 8.986a3.501 3.501 0 0 0 -4.446 -5.266l-4.34 2.534v6.946',
      'M18 16.302c1.391 .236 2.787 -.395 3.534 -1.689a3.474 3.474 0 0 0 -1.271 -4.745l-4.308 -2.514l-5.955 3.42'
    ]
  }],
  ['oauth 2.1', {
    strokePaths: [
      'M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0',
      'M12.556 6c.65 0 1.235 .373 1.508 .947l2.839 7.848a1.646 1.646 0 0 1 -1.01 2.108a1.673 1.673 0 0 1 -2.068 -.851l-.46 -1.052h-2.73l-.398 .905a1.67 1.67 0 0 1 -1.977 1.045l-.153 -.047a1.647 1.647 0 0 1 -1.056 -1.956l2.824 -7.852a1.664 1.664 0 0 1 1.409 -1.087l1.272 -.008'
    ]
  }],
  ['android', siAndroid], ['tensorflow', siTensorflow], ['keras', siKeras],
  ['firebase', siFirebase], ['capacitor', siCapacitor], ['ollama', siOllama],
  ['langgraph', siLanggraph], ['tauri 2', siTauri], ['zigbee2mqtt', siZigbee2mqtt],
  ['fastapi', siFastapi], ['python', siPython], ['vite', siVite], ['markdown', siMarkdown],
  ['mosquitto', { ...siEclipsemosquitto, assetSrc: new URL('./mosquitto-logo-only.svg', import.meta.url).href }],
  ['mermaid', siMermaid], ['github', siGithub], ['github actions', siGithubactions], ['jwt', siJsonwebtokens],
  ['html', siHtml5], ['scss', siSass], ['mcp', siModelcontextprotocol],
  ['google cloud', siGooglecloud], ['gin', siGin]
];

// Generic feature glyphs are used only for concepts, not as substitute brand marks.
const customIcons: Array<[string, string]> = [
  ['rag', 'M5 5h4v4H5z M15 5h4v4h-4z M10 15h4v4h-4z M7 9v3h5m5-3v3h-5m-2 0v3'],
  ['hybrid search', 'M4 5h10M4 10h6m-6 5h10M17 12v8m-3-3 3 3 3-3'],
  ['tool calling', 'M5 5h5v5H5z M14 14h5v5h-5z M10 7h4v4m0-4-4 4m0 1v2'],
  ['pgvector', 'M12 3 20 7v10l-8 4-8-4V7zm-4 6 8 6m0-6-8 6'],
  ['s3-compatible object storage', 'M4 7h16v13H4z M3 4h18v3H3zm5 7h8m-8 3h6'],
  ['zustand', 'M12 3v4m-5 1v11m10-11v11m-9-9h8m-8 4h8M9 19h6'],
  ['rest api', 'M5 5h14v5H5zm0 9h14v5H5zm3-6v6m8-6v6'],
  ['axum', 'M12 3v6m0 0L6 15m6-6 6 6M6 15v5m12-5v5M4 20h4m8 0h4'],
  ['fiber', 'M6 4l5 5-4 5 6 6M18 4l-5 5 4 5-6 6'],
  ['hapi', 'M4 7h4v4H4z M16 7h4v4h-4z M10 15h4v4h-4z M8 9h8m-6 2 1 4m2-4-1 4'],
  ['emqx', 'M4 9a12 12 0 0 1 16 0M7 12a7.5 7.5 0 0 1 10 0m-7 3a3 3 0 0 1 4 0m-2 3h.01'],
  ['seaorm', 'M4 8c2-3 5-3 8 0s6 3 8 0M4 13c2-3 5-3 8 0s6 3 8 0M4 18c2-3 5-3 8 0s6 3 8 0'],
  ['argon2', 'M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6zm-3 9 2 2 4-5'],
  ['speech-to-text', 'M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zm-7 8a7 7 0 0 0 14 0m-7 7v4m-4 0h8'],
  ['text-to-speech', 'M4 10v4h4l5 4V6l-5 4zm12-1a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12'],
  ['websocket', 'M4 7h12l-3-3m3 3-3 3m7 7H8l3 3m-3-3 3-3'],
  ['http', 'M4 6h16v12H4zm3 4h3m-3 4h6m3-4h2m-2 4h2'],
  ['sql ai agent', 'M5 5h5v5H5z M14 14h5v5h-5z M10 7h4v4m0-4-4 4m0 1v2']
];

const icons = new Map(iconEntries.map(([name, icon]) => [normalize(name), icon]));
for (const [name, path] of customIcons) icons.set(normalize(name), { path, custom: true });

const aliases: Record<string, string> = {
  'actix-web': 'actix web',
  'actixweb': 'actix web',
  'svelte 5': 'svelte',
  'node js': 'node.js',
  'githubactions': 'github actions',
  'google cloud platform': 'google cloud',
  'graph rag': 'rag',
  'vanilla javascript': 'javascript',
  'llm tool calling': 'tool calling',
  'fiber v3': 'fiber'
};

function normalize(name: string) {
  return name.trim().toLocaleLowerCase();
}

export function getTechIcon(name: string): TechIcon | undefined {
  const normalized = normalize(name);
  return icons.get(aliases[normalized] ?? normalized);
}
