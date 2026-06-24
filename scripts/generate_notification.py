# Генерирует громкий двухтоновый notification.mp3 (WAV PCM, совместим с браузерами)
import math
import struct
import wave
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'frontend' / 'public' / 'sounds'
OUT.mkdir(parents=True, exist_ok=True)
PATH = OUT / 'notification.wav'

SAMPLE_RATE = 44100


def tone(freq, duration, volume=0.9):
    samples = int(SAMPLE_RATE * duration)
    return [
        int(volume * 32767 * math.sin(2 * math.pi * freq * i / SAMPLE_RATE))
        for i in range(samples)
    ]


def main():
    data = tone(880, 0.15) + tone(660, 0.15) + tone(880, 0.2)
    with wave.open(str(PATH), 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        for sample in data:
            wf.writeframes(struct.pack('<h', sample))
    print('Created:', PATH)


if __name__ == '__main__':
    main()
