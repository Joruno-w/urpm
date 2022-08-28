import { r as runCli, q as prompts, a as parseNr } from './chunks/runner.mjs';
import fs, { existsSync, promises } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import 'readline';
import 'events';
import 'node:buffer';
import 'node:path';
import 'node:child_process';
import 'node:process';
import 'child_process';
import 'node:url';
import 'os';
import 'node:os';
import 'assert';
import 'buffer';
import 'stream';
import 'util';
import 'node:fs';
import 'tty';

let storage;
const storagePath = resolve(fileURLToPath(import.meta.url), "../_storage.json");
async function load(fn) {
  if (!storage) {
    storage = existsSync(storagePath) ? JSON.parse(await promises.readFile(storagePath, "utf-8")) || {} : {};
  }
  if (fn) {
    if (await fn(storage))
      await dump();
  }
  return storage;
}
async function dump() {
  if (storage)
    await promises.writeFile(storagePath, JSON.stringify(storage), "utf-8");
}

function getPackageJSON(cwd = process.cwd()) {
  const path = resolve(cwd, "package.json");
  if (fs.existsSync(path)) {
    try {
      const raw = fs.readFileSync(path, "utf-8");
      const data = JSON.parse(raw);
      return data;
    } catch (e) {
      console.warn("Failed to parse package.json");
      process.exit(0);
    }
  }
}

runCli(async (agent, args, ctx) => {
  const storage = await load();
  if (args[0] === "-") {
    if (!storage.lastRunCommand) {
      console.error("No last command found");
      process.exit(1);
    }
    args[0] = storage.lastRunCommand;
  }
  if (args.length === 0) {
    const pkg = getPackageJSON(ctx?.cwd);
    const scripts = pkg.scripts || {};
    const scriptsInfo = pkg["scripts-info"] || {};
    const names = Object.entries(scripts);
    if (!names.length)
      return;
    const choices = names.filter((i) => !i[0].startsWith("?")).map(([value, cmd]) => ({
      title: value,
      value,
      description: scriptsInfo[value] || scripts[`?${value}`] || cmd
    }));
    if (storage.lastRunCommand) {
      const last = choices.find((i) => i.value === storage.lastRunCommand);
      if (last)
        choices.unshift(last);
    }
    try {
      const { fn } = await prompts({
        name: "fn",
        message: "script to run",
        type: "autocomplete",
        choices
      });
      if (!fn)
        return;
      args.push(fn);
    } catch (e) {
      process.exit(1);
    }
  }
  if (storage.lastRunCommand !== args[0]) {
    storage.lastRunCommand = args[0];
    dump();
  }
  return parseNr(agent, args);
});
