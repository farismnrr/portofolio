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
  siRocksdb,
  siRust,
  siSass,
  siSqlite,
  siSvelte,
  siTensorflow,
  siTypescript,
  siVite,
  siVuedotjs,
  type SimpleIcon
} from 'simple-icons';

const iconEntries: Array<[string, SimpleIcon]> = [
  ['rust', siRust], ['actix web', siActix], ['postgresql', siPostgresql],
  ['mysql', siMysql], ['sqlite', siSqlite], ['rocksdb', siRocksdb], ['go', siGo],
  ['svelte', siSvelte], ['sveltekit', siSvelte], ['typescript', siTypescript],
  ['javascript', siJavascript], ['vue', siVuedotjs], ['nuxt', siNuxt], ['bun', siBun],
  ['node.js', siNodedotjs], ['nodejs', siNodedotjs], ['express', siExpress],
  ['docker', siDocker], ['nginx', siNginx], ['redis', siRedis], ['mqtt', siMqtt],
  ['opentelemetry', siOpentelemetry], ['prometheus', siPrometheus], ['kotlin', siKotlin],
  ['android', siAndroid], ['tensorflow', siTensorflow], ['keras', siKeras],
  ['firebase', siFirebase], ['capacitor', siCapacitor], ['ollama', siOllama],
  ['fastapi', siFastapi], ['python', siPython], ['vite', siVite], ['markdown', siMarkdown],
  ['mermaid', siMermaid], ['github actions', siGithubactions], ['jwt', siJsonwebtokens],
  ['html', siHtml5], ['scss', siSass], ['mcp', siModelcontextprotocol],
  ['google cloud', siGooglecloud], ['gin', siGin]
];

const icons = new Map(iconEntries.map(([name, icon]) => [normalize(name), icon]));
const aliases: Record<string, string> = {
  'actix-web': 'actix web',
  'actixweb': 'actix web',
  'svelte 5': 'svelte',
  'node js': 'node.js',
  'githubactions': 'github actions',
  'google cloud platform': 'google cloud'
};

function normalize(name: string) {
  return name.trim().toLocaleLowerCase();
}

export function getTechIcon(name: string) {
  const normalized = normalize(name);
  return icons.get(aliases[normalized] ?? normalized);
}
