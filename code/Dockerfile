FROM node:latest

RUN apt update

RUN apt install -y python3
RUN apt install -y python3-pip
RUN apt install -y ffmpeg

RUN python3 -m pip install git+https://github.com/pytube/pytube --break-system-packages
RUN python3 -m pip install requests --break-system-packages


WORKDIR /app

COPY package.json ./

# RUN npm install -g npm@latest
# RUN npm install

COPY . ./

CMD ["npm", "run", "start"]