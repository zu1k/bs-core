#!/bin/bash

pushd frontend
pnpm install
pnpm run build
popd