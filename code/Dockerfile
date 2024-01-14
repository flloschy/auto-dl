FROM node:latest
ENV NODE_ENV=production 

RUN apt update

RUN apt install -y python3
RUN apt install -y python3-pip
RUN apt install -y ffmpeg

RUN python3 -m pip install git+https://github.com/pytube/pytube --break-system-packages
RUN python3 -m pip install requests --break-system-packages

WORKDIR /app

COPY package.json ./
RUN npm i
COPY . ./

RUN npm run build
CMD ["npm", "run", "start"]