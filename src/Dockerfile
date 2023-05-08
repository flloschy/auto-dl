FROM python:3.9

WORKDIR /app

COPY main.py .
COPY config.json .

RUN apt update 
RUN apt install -y ffmpeg
RUN pip install requests

RUN python -m pip install git+https://github.com/pytube/pytube 

CMD [ "python", "./main.py" ]