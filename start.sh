pkill -f start-node-server.sh
pkill -f start-python-runner.sh

$(which git) pull

chmod +x ./start-node-server.sh
chmod +x ./start-python-runner.sh
chmod +x ./start.sh

./start-node-server.sh & ./start-python-runner.sh &