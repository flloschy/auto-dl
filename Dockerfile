# setup
FROM node:20.11.1
WORKDIR /app

# requirement
RUN apt-get update
RUN apt-get install -y python3 python3-pip ffmpeg ffprobe
RUN python3 -m pip install yt-dlp spotdl --break-system-packages

# build
WORKDIR /app/web
COPY ./web/package.json ./package.json
RUN npm i
COPY ./web .
RUN npm run build

# run
EXPOSE 3000
CMD ["node", "build"]