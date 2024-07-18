# setup
FROM node:20.11.1
WORKDIR /app

# requirement
RUN apt-get update
RUN apt-get install -y python3 python3-pip ffmpeg
RUN python3 -m pip install yt-dlp spotdl --break-system-packages

# build
WORKDIR /app/web
COPY package.json ./package.json
RUN npm i
COPY . .
RUN npm run build

# run
EXPOSE 3000
CMD ["sudo", "node", "build"]