FROM python:3.9

WORKDIR /app

COPY main.py .

RUN apt update && apt install -y ffmpeg
RUN pip install requests

# fork by smartprocure because pytube has an error which isnt fixed yet
RUN python -m pip install git+https://github.com/smartprocure/pytube
### RUN python -m pip install git+https://github.com/pytube/pytube 

CMD [ "python", "./main.py" ]