FROM node:16

WORKDIR /app

COPY index.js .

# RUN apt update -y && apt upgrade -y
RUN npm i ytdl-core@latest node-cron fluent-ffmpeg child_process
 
CMD [ "node", "index.js" ]