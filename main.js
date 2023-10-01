#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const core = require("@actions/core");

const commit = core.getInput("commit");
const checkout_dir = core.getInput("checkout-dir");
const checkout_url = core.getInput("checkout-url");

function run(cmd, args, cwd)
{
	const { status, signal, error } = spawnSync(cmd, args, {
		cwd: cwd || ".",
		stdio: "inherit",
	});
	if (status !== 0 || signal != null || error != null) {
		throw new Error(`Command error (${status}): ${cmd} ${args.join(" ")}`);
	}
}

function checkout(url, commit, dir)
{
	if (url === "" || commit === "" || dir === "") {
		return;
	}

	core.startGroup("Checkout project code");
	run("git", ["clone", "-n", "--filter=tree:0", "--progress",
	            "--", url, dir]);
	run("git", ["checkout", "--recurse-submodules", "--progress",
	            commit, "--"], dir);
	core.endGroup()
}

try {
	checkout(checkout_url, commit, checkout_dir);
} catch (e) {
	core.setFailed(e.message);
}
