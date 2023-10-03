#!/usr/bin/env node

const { checkIfAlreadyRun, setStatus } = require("#lib");

checkIfAlreadyRun().then(has_already_run => {
	if (!has_already_run) {
		setStatus("pending");
	}
});
