# setup
FROM node:20.11.1
WORKDIR /app

# requirement
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get install -y python3-pip
RUN apt-get install -y ffmpeg
RUN python3 -m pip install yt-dlp --break-system-packages

# build
COPY . /app
RUN npm i
RUN npm run build

# run
EXPOSE 3000
CMD ["node", "build"]