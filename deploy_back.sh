#!/bin/bash

# basic setting
_DEPLOY_DIR="/data/web"
_REPO="startup-mod"
_BACK_DIR="${_REPO}/server"
_BASEDIR=$(dirname $0)
pushd ${_BASEDIR} > /dev/null

# deploy back
cd
cd "${_BACK_DIR}"
git pull origin main
python app.py

# recovery
popd > /dev/null