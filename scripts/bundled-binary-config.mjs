const DEFAULT_UV_RELEASE_BASE_URL = 'https://github.com/astral-sh/uv/releases/download';
const DEFAULT_UV_MIRROR_PREFIX = 'https://gh-proxy.com/';
const DEFAULT_NODE_RELEASE_BASE_URL = 'https://nodejs.org/dist';
const DEFAULT_NODE_MIRROR_BASE_URL = 'https://registry.npmmirror.com/-/binary/node';

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function joinUrl(base, ...parts) {
  return [trimTrailingSlash(base), ...parts.map((part) => part.replace(/^\/+|\/+$/g, ''))].join('/');
}

function prependUrlPrefix(prefix, url) {
  const normalizedPrefix = prefix.trim();
  if (!normalizedPrefix) return null;
  return normalizedPrefix.endsWith('/') ? `${normalizedPrefix}${url}` : `${normalizedPrefix}/${url}`;
}

function uniqueUrls(urls) {
  return [...new Set(urls.filter(Boolean))];
}

export function shouldPreferMirrorDownloads(env = process.env) {
  const override = env.BUNDLED_BINARY_DOWNLOAD_ORDER?.trim().toLowerCase();
  if (override === 'mirror-first') return true;
  if (override === 'official-first') return false;
  return !(env.CI === 'true' || env.CI === '1');
}

export function getUvDownloadUrls(version, filename, env = process.env) {
  const officialBaseUrl = trimTrailingSlash(
    env.UV_DOWNLOAD_BASE_URL || DEFAULT_UV_RELEASE_BASE_URL,
  );
  const officialUrl = joinUrl(officialBaseUrl, version, filename);
  const mirrorUrl = env.UV_DOWNLOAD_MIRROR_BASE_URL
    ? joinUrl(env.UV_DOWNLOAD_MIRROR_BASE_URL, version, filename)
    : prependUrlPrefix(
        env.UV_DOWNLOAD_MIRROR_PREFIX || DEFAULT_UV_MIRROR_PREFIX,
        officialUrl,
      );

  return shouldPreferMirrorDownloads(env)
    ? uniqueUrls([mirrorUrl, officialUrl])
    : uniqueUrls([officialUrl, mirrorUrl]);
}

export function getNodeDownloadUrls(version, filename, env = process.env) {
  const officialBaseUrl = trimTrailingSlash(
    env.NODEJS_DOWNLOAD_BASE_URL || DEFAULT_NODE_RELEASE_BASE_URL,
  );
  const mirrorBaseUrl = trimTrailingSlash(
    env.NODEJS_DOWNLOAD_MIRROR_BASE_URL || DEFAULT_NODE_MIRROR_BASE_URL,
  );
  const officialUrl = joinUrl(officialBaseUrl, `v${version}`, filename);
  const mirrorUrl = joinUrl(mirrorBaseUrl, `v${version}`, filename);

  return shouldPreferMirrorDownloads(env)
    ? uniqueUrls([mirrorUrl, officialUrl])
    : uniqueUrls([officialUrl, mirrorUrl]);
}

function resolveCurrentPreparationTarget(platform = process.platform) {
  if (platform === 'darwin') return 'mac';
  if (platform === 'win32') return 'win';
  if (platform === 'linux') return 'linux';
  throw new Error(`Unsupported current platform for bundled binaries: ${platform}`);
}

const PREPARATION_PLANS = {
  mac: [
    { tool: 'uv', script: 'pnpm run uv:download:mac' },
  ],
  linux: [
    { tool: 'uv', script: 'pnpm run uv:download:linux' },
  ],
  win: [
    { tool: 'uv', script: 'pnpm run uv:download:win' },
    { tool: 'node', script: 'pnpm run node:download:win' },
  ],
  all: [
    { tool: 'uv', script: 'pnpm run uv:download:all' },
    { tool: 'node', script: 'pnpm run node:download:win' },
  ],
};

export function getPreparationPlan(target = 'current', platform = process.platform) {
  const resolvedTarget = target === 'current'
    ? resolveCurrentPreparationTarget(platform)
    : target;
  const plan = PREPARATION_PLANS[resolvedTarget];

  if (!plan) {
    throw new Error(`Unsupported bundled binary preparation target: ${target}`);
  }

  return plan.map((step) => ({ ...step }));
}
