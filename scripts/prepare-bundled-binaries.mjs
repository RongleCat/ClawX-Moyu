#!/usr/bin/env zx

import 'zx/globals';

import { getPreparationPlan } from './bundled-binary-config.mjs';

const requestedTarget = argv.platform || 'current';
const plan = getPreparationPlan(requestedTarget);

echo(chalk.cyan`📦 Preparing bundled binaries for target: ${requestedTarget}`);

for (const step of plan) {
  const scriptName = step.script.replace(/^pnpm run /, '');
  echo(chalk.blue`➡️ ${step.tool}: ${scriptName}`);
  await $`pnpm run ${scriptName}`;
}

echo(chalk.green`\n🎉 Bundled binaries are ready for packaging.`);
