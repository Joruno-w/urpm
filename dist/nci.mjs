import { r as runCli, p as parseNi } from './chunks/runner.mjs';
import 'path';
import 'readline';
import 'events';
import 'node:buffer';
import 'node:path';
import 'node:child_process';
import 'node:process';
import 'child_process';
import 'fs';
import 'node:url';
import 'os';
import 'node:os';
import 'assert';
import 'buffer';
import 'stream';
import 'util';
import 'node:fs';
import 'tty';

runCli(
  (agent, _, hasLock) => parseNi(agent, ["--frozen-if-present"], hasLock),
  { autoInstall: true }
);
