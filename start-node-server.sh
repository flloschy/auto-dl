#!/bin/bash

# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Fallback to default PATH if node or npm is not available
if ! [ -x "$(command -v node)" ] || ! [ -x "$(command -v npm)" ]; then
  PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
fi

# Now you can use node and npm
$(which npm) run build >> ./logs/node.log 2>&1
$(which node) -r dotenv/config build >> ./logs/node.log 2>&1