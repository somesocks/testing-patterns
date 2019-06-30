NPM=pnpm

TASKS=./tasks
NODE_BIN=./node_modules/.bin

.PHONY: default setup help

##
##
##	testing-patterns
##		this is the base project makefile
##
##

default: help

##	COMMANDS
##

##		make help - display the help
##
help:
	@grep "^##.*" ./Makefile

##		make setup - setup for local development
##
setup:
	sh $(TASKS)/setup.sh

##		make build - build the package
##
build:
	bash $(TASKS)/build.sh


test-mocha:
	sh $(TASKS)/test-mocha.sh

test-eslint:
	sh $(TASKS)/test-eslint.sh

##		make test - run test cases against the built package
##
test: test-mocha



##		make package-check - list the files that will be present in the package
##
package-check:
	@PATH=$(NODE_BIN):$(PATH) sh $(TASKS)/package-check.sh

##		make package-publish - publish the current dist dir
##
package-publish:
	@PATH=$(NODE_BIN):$(PATH) sh $(TASKS)/package-publish.sh

##
##
