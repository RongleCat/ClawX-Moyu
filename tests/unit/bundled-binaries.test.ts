import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  getNodeDownloadUrls,
  getPreparationPlan,
  getUvDownloadUrls,
} from '../../scripts/bundled-binary-config.mjs';

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
) as { scripts: Record<string, string> };

describe('bundled binary packaging', () => {
  it('routes packaging scripts through binary preparation', () => {
    expect(packageJson.scripts['init']).toContain('prepare:binaries');
    expect(packageJson.scripts['build']).toContain('prepare:binaries');
    expect(packageJson.scripts['package']).toContain('prepare:binaries');
    expect(packageJson.scripts['package:mac']).toContain('prepare:binaries:mac');
    expect(packageJson.scripts['package:linux']).toContain('prepare:binaries:linux');
    expect(packageJson.scripts['package:win']).toContain('prepare:binaries:win');
    expect(packageJson.scripts['release']).toContain('prepare:binaries');
  });

  it('prepares uv for mac/linux and uv plus node for windows', () => {
    expect(getPreparationPlan('mac')).toEqual([
      { tool: 'uv', script: 'pnpm run uv:download:mac' },
    ]);
    expect(getPreparationPlan('linux')).toEqual([
      { tool: 'uv', script: 'pnpm run uv:download:linux' },
    ]);
    expect(getPreparationPlan('win')).toEqual([
      { tool: 'uv', script: 'pnpm run uv:download:win' },
      { tool: 'node', script: 'pnpm run node:download:win' },
    ]);
  });

  it('prefers mirror urls during local development downloads', () => {
    const uvUrls = getUvDownloadUrls('0.10.0', 'uv-aarch64-apple-darwin.tar.gz', {});
    const nodeUrls = getNodeDownloadUrls('22.16.0', 'node-v22.16.0-win-x64.zip', {});

    expect(uvUrls[0]).toBe(
      'https://gh-proxy.com/https://github.com/astral-sh/uv/releases/download/0.10.0/uv-aarch64-apple-darwin.tar.gz',
    );
    expect(nodeUrls[0]).toBe(
      'https://registry.npmmirror.com/-/binary/node/v22.16.0/node-v22.16.0-win-x64.zip',
    );
  });

  it('prefers official urls first in CI while keeping mirror fallback', () => {
    const uvUrls = getUvDownloadUrls('0.10.0', 'uv-aarch64-apple-darwin.tar.gz', { CI: 'true' });
    const nodeUrls = getNodeDownloadUrls('22.16.0', 'node-v22.16.0-win-x64.zip', { CI: '1' });

    expect(uvUrls[0]).toBe(
      'https://github.com/astral-sh/uv/releases/download/0.10.0/uv-aarch64-apple-darwin.tar.gz',
    );
    expect(uvUrls[1]).toBe(
      'https://gh-proxy.com/https://github.com/astral-sh/uv/releases/download/0.10.0/uv-aarch64-apple-darwin.tar.gz',
    );
    expect(nodeUrls[0]).toBe(
      'https://nodejs.org/dist/v22.16.0/node-v22.16.0-win-x64.zip',
    );
    expect(nodeUrls[1]).toBe(
      'https://registry.npmmirror.com/-/binary/node/v22.16.0/node-v22.16.0-win-x64.zip',
    );
  });
});
