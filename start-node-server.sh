#!/bin/bash
$(which npm) run build >> ./logs/node.log 2>&1
$(which node) -r dotenv/config build >> ./logs/node.log 2>&1