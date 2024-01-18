touch ./data/data.json
echo "{}" > ./data/data.json

touch ./data/settings.json
echo "{\"autoDownloadingEnabled\":false,\"waitListIntervalTime\":1800,\"channelListIntervalTime\":7200,\"systemRoot\":\"C:/\",\"pythonCommand\":\"python3\"}" > ./data/settings.json

touch ./data/waitlist.txt
touch ./data/latest.txt
touch ./data/log.txt

mkdir ./data/temp
mkdir ./data/videos