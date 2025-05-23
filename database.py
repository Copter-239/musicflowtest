from hashlib import sha256, sha384
from random import choice
from time import time


class database:
    data = {}
    __pepper = ''
    __func = [sha384, sha256]
    __alf = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

    def timing_decorator(self, func):
        def wrapper():
            start_time = time()
            func()
            print(f"Функция {func.__name__} выполнялась {time() - start_time:.2f} секунд")

        return wrapper

    def encode(self, x):
        return ''.join([[[[fg[1] + b[fg[0]]][0] for fg in enumerate([f[k * 3] + f[k * 3 + 1] + f[k * 3 + 2] for k in range(32)])] for f in [self.__func[0](str(str(self.__func[1](str(self.__pepper + str(b)[::-1]).encode('utf-8')).hexdigest()) + x).encode('utf-8')).hexdigest()[::-1]]][0] for b in[''.join([choice(self.__alf) for u in range(32)])]][0])

    def examhash(self, f, password):
        return [[self.__func[0]((self.__func[1]((self.__pepper + g[1][::-1]).encode('utf-8')).hexdigest() + password).encode('utf-8')).hexdigest()[::-1] == g[0]][0] for g in [[''.join([f[k * 4] + f[k * 4 + 1] + f[k * 4 + 2] for k in range(32)]),''.join([f[k * 4 + 3] for k in range(32)])]]][0]

    def genkey(self, x, alf='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-'):
        return ''.join([choice(alf) for u in range(x)])

    def updatepepper(self, newPepper=10):
        self.__pepper = newPepper if ("<class 'int'>" != str(type(newPepper))) else self.genkey(newPepper)
        return self.__pepper

    def __init__(self, pepper=None, func=None):
        if pepper != None:
            self.__pepper = pepper
        else:
            self.__pepper = self.genkey(10)
        if func != None:
            self.__func = func
