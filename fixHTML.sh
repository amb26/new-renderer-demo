#!/bin/bash
set -e
set -x #echo on

# Script only useful on strange Cygwin systems like mine to reset permissions of rewritten HTML files

find . -name node_modules -prune -o -name "*.html" | xargs chmod 644
