#!/bin/bash
npm run build >> ./logs/node.log 2>&1
node -r dotenv/config build >> ./logs/node.log 2>&1