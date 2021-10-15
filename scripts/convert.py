import json
import os
from math import sqrt
import re


def norm(vec):
    dot = 0

    for v in vec:
        dot += v*v

    return sqrt(dot)


def main():
    filename = 'embedding.txt'
    embedding = dict()

    with open(filename, encoding='utf-8') as f:
        args = f.readline().strip('\n').split(' ')
        embedding['size'] = int(args[1])
        embedding['embedding'] = dict()

        for line in f:
            word, *vector = line.strip().split(' ')

            if not re.fullmatch(r'[а-яА-Я\-]+', word) or len(word) < 3:
                continue

            assert(len(vector) == embedding['size'])
            vector = [float(v) for v in vector]
            length = norm(vector)
            vector = [v / length for v in vector]
            embedding['embedding'][word] = vector

    with open(filename + '.js', 'w', encoding='utf-8') as f:
        f.write('const EMBEDDING = ' + json.dumps(embedding))


if __name__ == '__main__':
    main()
