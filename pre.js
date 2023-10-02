#!/usr/bin/env node

const core = require("@actions/core");

const commit = core.getInput("commit");
const name = core.getInput("name");
const description = core.getInput("description");

function setStatus(commit, name, description, status)
{
	core.startGroup("Mark job as pending");
	core.info("Test123");
	core.endGroup();
}

try {
	setStatus(commit, name, description, "pending");
} catch (e) {
	core.setFailed(e.message);
}
