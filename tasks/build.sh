#!/bin/bash

#
# turn this on to debug script
# set -x

#
# abort on error
set -e

PACKAGE_NAME=ts-test

#
# expects to be run from root
ROOT_DIR=.
SRC_DIR=$ROOT_DIR/src
DIST_DIR=$ROOT_DIR/dist

#
# add local node_modules bin to path
NODE_BIN=$ROOT_DIR/node_modules/.bin
PATH=$PATH:$NODE_BIN


echo ""
echo "[INFO] starting build for ($PACKAGE_NAME)"

_makeBuildDir () {
	#
	# make a temporary build dir
	# this command is linux / osx agnostic
	# https://unix.stackexchange.com/questions/30091/fix-or-alternative-for-mktemp-in-os-x
	echo "[INFO] creating temporary build dir"
	BUILD_DIR=''
	BUILD_DIR=`mktemp -d 2>/dev/null || mktemp -d -t 'build-dir'`
}

_unmakeBuildDir () {
	#
	# clean up build dir
	echo "[INFO] removing temporary build dir"
	rm -rf $BUILD_DIR
}

_buildTSC () {
	#
	# build typescript into temp dir
	echo "[INFO] compiling TS into build dir"
	tsc \
		--outDir "$BUILD_DIR"
}

_buildJS () {
	#
	# copy src/**/*.js into temp dir
	echo "[INFO] copying JS into build dir"
	rsync \
		--update \
		--recursive \
		--include='*.js' \
		--exclude='*' \
		$SRC_DIR/ \
		$BUILD_DIR
		# --itemize-changes \
}

_buildExtras () {
	echo ''
	cp ./package.json $BUILD_DIR/
	cp ./pnpm-lock.yaml $BUILD_DIR/
	cp ./LICENSE $BUILD_DIR/
}

_writeBuildToDist () {
	#
	# use rsync to fast-sync the dist dir with the build dir
	echo "[INFO] writing build to dist"
	rsync \
		--update \
		--recursive \
		--delete \
		$BUILD_DIR/ \
		$DIST_DIR
		# --itemize-changes \
}

_cleanup () {
	_unmakeBuildDir || true
	echo "[INFO] build for ($PACKAGE_NAME) finished!"
	echo ""
}

trap _cleanup ERR EXIT

_makeBuildDir
_buildJS
_buildTSC
_buildExtras
_writeBuildToDist
