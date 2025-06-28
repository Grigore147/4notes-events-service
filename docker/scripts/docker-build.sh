#!/bin/bash

# ################################################################################################ #
#                                          Docker Build                                            #
# ################################################################################################ #

set -euo pipefail

# Get current working directory
CURRENT_DIR=$(pwd)

# Get directory of this script
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
NGINX_DOCKER_FILE_PATH=${SCRIPT_DIR}/../nginx/Dockerfile
APP_DOCKER_FILE_PATH=${SCRIPT_DIR}/../php/Dockerfile
DOCKER_BUILD_CONTEXT=${SCRIPT_DIR}/../../

# Required Environment Variables
[[ -z $GIT_BRANCH ]] && { echo "▣ GIT_BRANCH is required"; exit 1; }
[[ -z $CI_SERVICE_NAME ]] && { echo "▣ CI_SERVICE_NAME is required"; exit 1; }
[[ -z $CI_SERVICE_VERSION ]] && { echo "▣ CI_SERVICE_VERSION is required"; exit 1; }
[[ -z $CI_SERVICE_ENVIRONMENT ]] && { echo "▣ CI_SERVICE_ENVIRONMENT is required"; exit 1; }
[[ -z $CI_SERVICE_IMAGE_REPOSITORY_URL ]] && { echo "▣ CI_SERVICE_IMAGE_REPOSITORY_URL is required"; exit 1; }
[[ -z $CI_SERVICE_IMAGE ]] && { echo "▣ CI_SERVICE_IMAGE is required"; exit 1; }

SERVICE_NGINX_IMAGE=${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-nginx:${CI_SERVICE_VERSION}
SERVICE_APP_IMAGE=${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-app:${CI_SERVICE_VERSION}

# Pushing Docker image to registry is allowed by -p or --push flag, default is false
PUSH_IMAGES=false

if [[ "$#" -gt 0 && ( "$1" == "-p" || "$1" == "--push" ) ]]; then
    PUSH_IMAGES=true
fi

# Building Docker Image
if [[ $PUSH_IMAGES = true ]]; then
    echo "▣ Building Docker Image and Pushing to Docker Registry"
else
    echo "▣ Building Docker Image"
fi

# Build Nginx Image
docker build \
    --file ${NGINX_DOCKER_FILE_PATH} \
    --tag ${SERVICE_NGINX_IMAGE} \
    --build-arg SERVICE_NAME=${CI_SERVICE_NAME} \
    --build-arg SERVICE_ENVIRONMENT=$CI_SERVICE_ENVIRONMENT \
    --build-arg SERVICE_VERSION=${CI_SERVICE_VERSION} \
    ${DOCKER_BUILD_CONTEXT}

echo "▣ BUILD IMAGE: ${SERVICE_NGINX_IMAGE}"

# Build App (PHP-FPM) Image
docker build \
    --file ${APP_DOCKER_FILE_PATH} \
    --tag ${SERVICE_APP_IMAGE} \
    --build-arg SERVICE_NAME=${CI_SERVICE_NAME} \
    --build-arg SERVICE_ENVIRONMENT=$CI_SERVICE_ENVIRONMENT \
    --build-arg SERVICE_VERSION=${CI_SERVICE_VERSION} \
    ${DOCKER_BUILD_CONTEXT}

echo "▣ BUILD IMAGE: ${SERVICE_APP_IMAGE}"

# Version built for latest commit on develop branch is tagged as latest as well
if [[ $GIT_BRANCH = "develop" ]]; then
    docker tag ${SERVICE_NGINX_IMAGE} ${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-nginx:latest
    docker tag ${SERVICE_APP_IMAGE} ${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-app:latest

    echo "▣ Tagged Docker Images as latest"
    echo "▣ LATEST IMAGE NGINX: ${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-nginx:latest"
    echo "▣ LATEST IMAGE APP: ${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-app:latest"
fi

# Version built on main branch is tagged as stable
if [[ $GIT_BRANCH = "main" ]]; then
    docker tag ${SERVICE_NGINX_IMAGE} ${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-nginx:stable
    docker tag ${SERVICE_APP_IMAGE} ${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-app:stable

    echo "▣ Tagged Docker Images as stable"
    echo "▣ STABLE IMAGE NGINX: ${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-nginx:latest"
    echo "▣ STABLE IMAGE APP: ${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-app:latest"
fi

# Push Docker Images to Registry if flag push is set
if [[ $PUSH_IMAGES = true ]]; then
    echo "▣ Pushing Docker Images to Registry ..."

    docker push ${SERVICE_NGINX_IMAGE}
    docker push ${SERVICE_APP_IMAGE}

    if [[ $GIT_BRANCH = "develop" ]]; then
        docker push ${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-nginx:latest
        docker push ${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-app:latest
    fi

    if [[ $GIT_BRANCH = "main" ]]; then
        docker push ${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-nginx:stable
        docker push ${CI_SERVICE_IMAGE_REPOSITORY_URL}/${CI_SERVICE_NAME}-app:stable
    fi
fi

echo "▣ Docker Build Completed!"
