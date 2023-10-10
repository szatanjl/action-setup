#!/usr/bin/env node

const { checkIfAlreadyRun, checkout, setStatus } = require("#lib");

checkIfAlreadyRun().then(has_already_run => {
	if (!has_already_run) {
		setStatus("pending").then(checkout);
	}
});
