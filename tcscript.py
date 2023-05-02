import os
import time
import signal
import sys

TOP = 12000
BOTTOM = 1000


def on_exit(signum, frame):
    print()
    print("exiting, unset bandwidth limit")
    os.system("tc qdisc del dev wlp0s20f3 root")
    sys.exit(0)
    pass


if __name__ == "__main__":
    signal.signal(signal.SIGINT, on_exit)
    signal.signal(signal.SIGTERM, on_exit)
    down: bool = True
    current: int = TOP
    while True:
        print("limiting bandwidth to {}kbit".format(current))
        os.system(
            "tc qdisc add dev wlp0s20f3 root tbf rate {}kbit latency 50ms burst 15kb".format(current))
        time.sleep(3)
        os.system("tc qdisc del dev wlp0s20f3 root")
        if down:
            current -= 1000
        else:
            current += 1000
            pass
        if current == TOP or current == BOTTOM:
            down = not down
            pass
    pass
