#!/bin/sh

python app/main.py "$@" || echo "run error code: $?"
