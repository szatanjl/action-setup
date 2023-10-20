#!/usr/bin/env node

const { setStatus, uploadArtifacts } = require("#lib");

uploadArtifacts()
	.then(() => setStatus("failure"))
	.catch(() => setStatus("error"));
