import time

def log(text):
    with open("./data/log.txt", "a") as f:
        print(str(int(time.time())) + ' # ' + text)
        f.write(str(int(time.time())) + ' # ' + text +"\n")