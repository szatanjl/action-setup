#!/usr/bin/env node

const { setStatus, uploadArtifacts } = require("#lib");

uploadArtifacts()
	.then(() => setStatus("success"))
	.catch(() => setStatus("error"));
