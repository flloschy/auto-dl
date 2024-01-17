cd /mnt/jellyfin/auto-dl

pkill -f start-node-server.sh
pkill -f start-python-runner.sh

$(which git) pull

./start-node-server.sh &
./start-python-runner.sh &