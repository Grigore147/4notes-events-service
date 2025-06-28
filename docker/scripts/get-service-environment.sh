#!/usr/bin/env bash

# ################################################################################################ #
#                                   Service Environment Metadata                                   #
#                   Outputs metadata for the current service environment as JSON                   #
# ################################################################################################ #

set -euo pipefail

# Get current working directory
CURRENT_DIR=$(pwd)

# Get directory of this script
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# Get service environment metadata exported from cicd-entrypoint.sh
source ${SCRIPT_DIR}/cicd-entrypoint.sh &>/dev/null

cat <<EOF
{
    "GIT_BRANCH": "${GIT_BRANCH}",
    "GIT_COMMIT": "${GIT_COMMIT}",
    "CI_PROJECT_NAME": "${CI_PROJECT_NAME}",
    "CI_PROJECT_KEY": "${CI_PROJECT_KEY}",
    "CI_PROJECT_DOMAIN": "${CI_PROJECT_DOMAIN}",
    "CI_SERVICE_NAME": "${CI_SERVICE_NAME}",
    "CI_SERVICE_ENVIRONMENT": "${CI_SERVICE_ENVIRONMENT}",
    "CI_SERVICE_NAMESPACE": "${CI_SERVICE_NAMESPACE}",
    "CI_SERVICE_VERSION": "${CI_SERVICE_VERSION}",
    "CI_SERVICE_IMAGE_REPOSITORY_URL": "${CI_SERVICE_IMAGE_REPOSITORY_URL}",
    "CI_SERVICE_IMAGE_TAG": "${CI_SERVICE_IMAGE_TAG}",
    "CI_SERVICE_IMAGE": "${CI_SERVICE_IMAGE}",
    "CI_SERVICE_URL": "${CI_SERVICE_URL}",
    "CI_SERVICE_URL_PATH": "${CI_SERVICE_URL_PATH}"
}
EOF
