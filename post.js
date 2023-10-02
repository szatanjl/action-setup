#!/usr/bin/env node

const core = require("@actions/core");

const commit = core.getInput("commit");
const name = core.getInput("name");
const description = core.getInput("description");
const status = "TODO";

function setStatus(commit, name, description, status)
{
	core.startGroup("Mark job as done");
	core.info("Test123");
	core.endGroup();
}

try {
	setStatus(commit, name, description, status);
} catch (e) {
	core.setFailed(e.message);
}
