#!/bin/bash

mkdir ./data
mkdir ./data/temp
mkdir ./data/videos

touch ./data/waitlist.txt
touch ./data/log.txt

touch ./data/data.json
echo "{}" > ./data/data.json

touch ./data/settings.json
echo "{\"autoDownloadingEnabled\":false,\"waitListIntervalTime\":1800,\"channelListIntervalTime\":7200,\"systemRoot\":\"C:/\",\"pythonCommand\":\"python3\"}" > ./data/settings.json

touch ./data/latest.txt
echo "0,0" > ./data/latest.txt
