#!/bin/bash

mkdir frontend
git --work-tree=./frontend checkout frontend -- .
pnpm install
pnpm run build
