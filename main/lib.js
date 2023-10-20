const { spawnSync } = require("node:child_process");
const path = require("node:path");
const artifact = require("@actions/artifact");
const core = require("@actions/core");
const github = require("@actions/github");

function checkIfAlreadyRun()
{
return _fn("Check if job already run", !core.getBooleanInput("force"), () => {
	const commit = core.getInput("commit");
	const name = core.getInput("name");
	const token = core.getInput("token");

	const { owner, repo } = github.context.repo;
	const octokit = github.getOctokit(token);

	return octokit.paginate("GET /repos/{owner}/{repo}/statuses/{commit}", {
		owner,
		repo,
		commit,
	}).then(resp => {
		const status = resp.sort((x, y) => {
			const xd = x.updated_at;
			const yd = y.updated_at;
			return (xd < yd) - (xd > yd);
		}).find(x => x.context === name);

		if (status == null) {
			core.info("Job has not yet run");
			return false;
		}

		core.info(`Status of previous run: ${status.state}`);
		core.info(`Previous run: <${status.target_url}>`);

		if (status.state === "success") {
			core.notice(`Job has already run and succeded: <${status.target_url}>`);
			core.setOutput("has-already-run", true);
			return true;
		}

		if (status.state === "failure") {
			core.setOutput("has-already-run", true);
			throw new Error(`Job has already run and failed: <${status.target_url}>`);
		}

		core.info("Job has already run but was inconclusive");
		return false;
	});
});
}

function setStatus(status)
{
return _fn(`Set status: ${status}`, () => {
	const commit = core.getInput("commit");
	const name = core.getInput("name");
	const description = core.getInput("description");
	const token = core.getInput("token");

	const { owner, repo } = github.context.repo;
	const octokit = github.getOctokit(token);

	return octokit.request("POST /repos/{owner}/{repo}/statuses/{commit}", {
		owner,
		repo,
		commit,
		context: name,
		description: `${description} (${status})`,
		state: status,
		target_url: `https://github.com/${owner}/${repo}/actions/runs/${github.context.runId}`,
	});
});
}

function checkout()
{
	const dir = core.getInput("checkout-dir");
	const url = core.getInput("checkout-url");

return _fn("Checkout project", dir !== "" && url !== "", () => {
	const commit = core.getInput("commit");

	_git(["clone", "-n", "--filter=tree:0", "--progress", "--", url, dir]);
	_git(["checkout", "--recurse-submodules", "--progress", commit, "--"], dir);
});
}

function uploadArtifacts()
{
	const files = core.getMultilineInput("upload");

return _fn("Upload artifacts", files.length > 0, () => {
	const commit = core.getInput("commit");
	const name = core.getInput("name");

	const client = artifact.create();

	return client.uploadArtifact(
		`${commit}-${name}`,
		files,
		_rootDir(files),
		{ continueOnError: false }
	);
});
}

function _fn(name, cond, fn)
{
	if (!cond) {
		return Promise.resolve();
	}

	return core.group(name, () => Promise.resolve().then(fn).catch(e => {
		core.setFailed(e.message);
		throw e;
	}));
}

function _git(args, cwd)
{
	core.info(`$ git ${args.join(" ")}`);

	const opts = {
		cwd: cwd || ".",
		stdio: "inherit",
	};
	const { status, signal, error } = spawnSync("git", args, opts);

	if (status !== 0 || signal != null || error != null) {
		throw new Error(`Command failed (${status}): git ${args.join(" ")}`);
	}
}

function _rootDir(files)
{
	const prefix = files
		.map(fname => path.normalize(fname).split(path.sep).slice(0, -1))
		.map(path => {
			if (path[0] === "") {
				path[0] = "/";
			} else {
				path.unshift(".");
			}
			return path;
		})
		.reduce((prefix, path) => {
			for (let i = 0; i < prefix.length; i++) {
				if (prefix[i] !== path[i]) {
					return prefix.slice(0, i);
				}
			}
			return prefix;
		});

	if (prefix.length > 0) {
		return path.join(...prefix);
	}

	return "/";
}

module.exports = {
	checkIfAlreadyRun,
	checkout,
	setStatus,
	uploadArtifacts,
};
