FROM node:18.19.0

RUN apt update && apt install -y python3 \
        python3-pip \
        ffmpeg

RUN python3 -m pip install git+https://github.com/pytube/pytube --break-system-packages
RUN python3 -m pip install requests --break-system-packages

WORKDIR /app

COPY package.json ./
RUN npm install
COPY . ./

ENV NODE_ENV=production

RUN npm run build
CMD ["npm", "run", "start"]