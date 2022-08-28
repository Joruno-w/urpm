'use strict';

const runner = require('./chunks/runner.cjs');
const fs = require('fs');
const require$$0 = require('path');
const url = require('url');
require('readline');
require('events');
require('node:buffer');
require('node:path');
require('node:child_process');
require('node:process');
require('child_process');
require('node:url');
require('os');
require('node:os');
require('assert');
require('buffer');
require('stream');
require('util');
require('node:fs');
require('tty');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

const fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

let storage;
const storagePath = require$$0.resolve(url.fileURLToPath((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('nr.cjs', document.baseURI).href))), "../_storage.json");
async function load(fn) {
  if (!storage) {
    storage = fs.existsSync(storagePath) ? JSON.parse(await fs.promises.readFile(storagePath, "utf-8")) || {} : {};
  }
  if (fn) {
    if (await fn(storage))
      await dump();
  }
  return storage;
}
async function dump() {
  if (storage)
    await fs.promises.writeFile(storagePath, JSON.stringify(storage), "utf-8");
}

function getPackageJSON(cwd = process.cwd()) {
  const path = require$$0.resolve(cwd, "package.json");
  if (fs__default.existsSync(path)) {
    try {
      const raw = fs__default.readFileSync(path, "utf-8");
      const data = JSON.parse(raw);
      return data;
    } catch (e) {
      console.warn("Failed to parse package.json");
      process.exit(0);
    }
  }
}

runner.runCli(async (agent, args, ctx) => {
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
      const { fn } = await runner.prompts({
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
  return runner.parseNr(agent, args);
});
