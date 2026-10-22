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
  siGithubactions,
  siGo,
  siGooglecloud,
  siHtml5,
  siJavascript,
  siJsonwebtokens,
  siKeras,
  siKotlin,
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
  type SimpleIcon
} from 'simple-icons';

type TechIcon = Pick<SimpleIcon, 'path'> & { custom?: boolean };

const iconEntries: Array<[string, TechIcon]> = [
  ['rust', siRust], ['actix web', siActix], ['postgresql', siPostgresql],
  ['mysql', siMysql], ['sqlite', siSqlite], ['rocksdb', siRocksdb], ['go', siGo],
  ['svelte', siSvelte], ['sveltekit', siSvelte], ['typescript', siTypescript],
  ['javascript', siJavascript], ['vue', siVuedotjs], ['nuxt', siNuxt], ['bun', siBun],
  ['node.js', siNodedotjs], ['nodejs', siNodedotjs], ['express', siExpress],
  ['docker', siDocker], ['nginx', siNginx], ['redis', siRedis], ['mqtt', siMqtt],
  ['opentelemetry', siOpentelemetry], ['prometheus', siPrometheus], ['kotlin', siKotlin],
  ['react', siReact], ['tailwind css', siTailwindcss], ['nestjs', siNestjs],
  ['drizzle orm', siDrizzle], ['timescaledb', siTimescale],
  ['android', siAndroid], ['tensorflow', siTensorflow], ['keras', siKeras],
  ['firebase', siFirebase], ['capacitor', siCapacitor], ['ollama', siOllama],
  ['fastapi', siFastapi], ['python', siPython], ['vite', siVite], ['markdown', siMarkdown],
  ['mermaid', siMermaid], ['github actions', siGithubactions], ['jwt', siJsonwebtokens],
  ['html', siHtml5], ['scss', siSass], ['mcp', siModelcontextprotocol],
  ['google cloud', siGooglecloud], ['gin', siGin]
];

// Original monochrome glyphs for technologies without a Simple Icons mark.
const customIcons: Array<[string, string]> = [
  ['rag', 'M5 5h4v4H5z M15 5h4v4h-4z M10 15h4v4h-4z M7 9v3h5m5-3v3h-5m-2 0v3'],
  ['voyage ai embeddings', 'M4 7h5v5H4z M15 4h5v5h-5z M10 15h5v5h-5z M9 9l6-3m-6 5 3 4'],
  ['hybrid search', 'M4 5h10M4 10h6m-6 5h10M17 12v8m-3-3 3 3 3-3'],
  ['tool calling', 'M5 5h5v5H5z M14 14h5v5h-5z M10 7h4v4m0-4-4 4m0 1v2'],
  ['pgvector', 'M12 3 20 7v10l-8 4-8-4V7zm-4 6 8 6m0-6-8 6'],
  ['bullmq', 'M4 6h4v4H4z M10 6h4v4h-4z M16 6h4v4h-4z M7 10v5h10v-5m-5 5v4'],
  ['s3-compatible object storage', 'M4 7h16v13H4z M3 4h18v3H3zm5 7h8m-8 3h6'],
  ['zustand', 'M12 3v4m-5 1v11m10-11v11m-9-9h8m-8 4h8M9 19h6'],
  ['rest api', 'M5 5h14v5H5zm0 9h14v5H5zm3-6v6m8-6v6'],
  ['langgraph', 'M5 5h4v4H5z M15 15h4v4h-4z M15 5h4v4h-4z M9 7h6m2 2v6m-2 2h-6m0 0v-2m0 2 2-2m-2 2-2-2'],
  ['axum', 'M12 3v6m0 0L6 15m6-6 6 6M6 15v5m12-5v5M4 20h4m8 0h4'],
  ['fiber', 'M6 4l5 5-4 5 6 6M18 4l-5 5 4 5-6 6'],
  ['hapi', 'M4 7h4v4H4z M16 7h4v4h-4z M10 15h4v4h-4z M8 9h8m-6 2 1 4m2-4-1 4'],
  ['emqx', 'M4 9a12 12 0 0 1 16 0M7 12a7.5 7.5 0 0 1 10 0m-7 3a3 3 0 0 1 4 0m-2 3h.01'],
  ['seaorm', 'M4 8c2-3 5-3 8 0s6 3 8 0M4 13c2-3 5-3 8 0s6 3 8 0M4 18c2-3 5-3 8 0s6 3 8 0'],
  ['argon2', 'M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6zm-3 9 2 2 4-5'],
  ['openai api', 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z'],
  ['sql', 'M4 6c0-2 16-2 16 0v12c0 2-16 2-16 0zm0 0c0 2 16 2 16 0M4 12c0 2 16 2 16 0'],
  ['tokio', 'M4 5h16v14H4zm4 4h8m-8 4h5m-5 3h8'],
  ['sqlx', 'M4 6c0-2 16-2 16 0v12c0 2-16 2-16 0zm0 0c0 2 16 2 16 0M8 10h8m-8 4h5'],
  ['askama', 'M12 3 21 8v8l-9 5-9-5V8zm-4 9 3 3 6-7'],
  ['speech-to-text', 'M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zm-7 8a7 7 0 0 0 14 0m-7 7v4m-4 0h8'],
  ['text-to-speech', 'M4 10v4h4l5 4V6l-5 4zm12-1a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12'],
  ['mosquitto', 'M4 7h16v10H4zm3 3h3v4H7zm7 0h3m-3 3h3'],
  ['zigbee2mqtt', 'M12 3v18m-7-14 14 10M5 17 19 7M9 7l3-4 3 4m-6 10-2 4h10l-2-4'],
  ['tuya cloud api', 'M3 9a9 9 0 0 1 18 0c0 6-9 12-9 12S3 15 3 9zm6 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0'],
  ['websocket', 'M4 7h12l-3-3m3 3-3 3m7 7H8l3 3m-3-3 3-3'],
  ['http', 'M4 6h16v12H4zm3 4h3m-3 4h6m3-4h2m-2 4h2'],
  ['tauri 2', 'M12 3 20 7v10l-8 4-8-4V7zm-3 5h6v8H9zm-2 0h2m6 0h2'],
  ['docker compose', 'M4 7h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM7 11v5h10v-5m-5 5v4'],
  ['ghcr', 'M4 5h16v14H4zm4 4h8v6H8zm2 2h4v2h-4']
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
  'openai': 'openai api',
  'graph rag': 'rag',
  'vanilla javascript': 'javascript',
  'llm tool calling': 'tool calling'
};

const fallbackIcon: TechIcon = {
  path: 'M5 7h14v10H5zM9 4v3m6-3v3m-6 10v3m6-3v3M2 10h3m14 0h3M2 14h3m14 0h3'
};

function normalize(name: string) {
  return name.trim().toLocaleLowerCase();
}

export function getTechIcon(name: string): TechIcon {
  const normalized = normalize(name);
  return icons.get(aliases[normalized] ?? normalized) ?? fallbackIcon;
}
