const core = require("@actions/core");
const github = require("@actions/github");

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

function _fn(name, fn)
{
	return core.group(name, () => Promise.resolve().then(fn).catch(e => {
		core.setFailed(e.message);
		throw e;
	}));
}

module.exports = {
	setStatus,
};
