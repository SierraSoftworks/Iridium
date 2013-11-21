#!/usr/bin/env bash
# Paths to different commands
NODE=$(which node)

success() {
	echo -e '\e[1;32mOK\e[0m'
}

fail() {
	echo -e '\e[1;31mFAILED\e[0m'
	exit 1
}

echo -ne "Installing NPM Modules..."
npm install > /dev/null && success || fail

echo -ne "Running Test Suite..."
$NODE test/run && success || fail