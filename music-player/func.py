from json import loads, dumps
from pprint import pprint
from database import *
from datetime import datetime
from tinytag import TinyTag

token = {
    'pepper': 'ov8vF6q435jNIrEIpKEQ'
}
database = database(token['pepper'])
database.data = {
    'music': [
        {
            'id': 1,
            'date': '15.04.2025.20.20',
            'durationSec': 201,
            'tag': [],
            'album': [],
            'listening': 0,
            'comment': 0,
            'author': 'КИНО',
            'author_login': 'test',
            'name': 'Группа крови',
            "description": "песня Цоя, Группа крови",
            'id music data': '1'
        },
        {
            'id': 2,
            'date': '15.04.2025.21.21',
            'durationSec': 267,
            'tag': [],
            'album': [],
            'listening': 0,
            'comment': 0,
            'author': 'КИНО',
            'author_login': 'test',
            'name': 'Пачка сигарет',
            "description": "песня Цоя, пачка сигарет",
            'id music data': '2'
        },
        {
            'id': 3,
            'date': '17.04.2025.2.22',
            'durationSec': 224,
            'tag': [],
            'album': [],
            'listening': 0,
            'comment': 0,
            'author': 'КИНО',
            'author_login': 'test',
            'name': 'Звезда По Имени Солнце',
            "description": "песня Цоя, Звезда По Имени Солнце",
            'id music data': '3'
        },
    ],
    'album': [
        {
            'id': 1,
            'date': '15.04.2025.21.21',
            'music': [2, 1, 3],
            'author': 'КИНО',
            'author_login': 'test',
            'name': 'Группа крови',
            "description": "песни Цоя",
            "img": '1'
        }
    ],
    'user': {
        'test': {
            'album': [1],
            'date': '24.04.2025.01.10',
            'description': '',
            'id': 1,
            'img': [],
            'login': 'test',
            'login hash': '6bcCc44t298n4a9810fI641Of86z40dSc36Iba31d4ed1095fach468C82dH6c4efb2rdb36f64V95457b0M23f1fedsb65t007g4a03d27Vec1Od3cNeafPac0j739u',
            'music': [],
            'name': '',
            'password hash': 'd813439Kfd0a414D9f8mdf5j4f2K25dK13efaa4679ecd75T7e9ydf8De36j453efa8f324W3af6fbcp8efqbbeq231If59cb12B9ddN6das8aaJ9a6h8cfkfc2Nf7bb',
            'update hash': 1745446228
        }
    },
    'session': {}
}


def in_plys(q, w):
    for t in q:
        if not t in w: return False
    return True


def sorted_plys(obj, method):
    return sorted(obj)


def catolog_music(data):
    pprint(database.data)
    try:
        data = loads(data)
        print(data, str(type(data['page'])), str(type(data['page'])) == '<class \'list\'>')
        if str(type(data['page'])) == '<class \'dict\'>':
            datas = []
            if data['durationSec']['max'] == -1:
                data['durationSec']['max'] = float('inf')
            if data['durationSec']['max'] > data['durationSec']['min']:
                for pr in database.data['music']:
                    if data['durationSec']['max'] >= pr['durationSec'] >= data['durationSec']['min'] and in_plys(
                            data['tag'], pr['tag']) and (
                            data["search"].lower() in pr['name'].lower() or data["search"].lower() in pr[
                        'description'].lower()):
                        datas.append(pr)
            if datas:
                if data["sorted"]:
                    datas = sorted_plys(datas, data["sorted"])
                if len(datas) >= int(data["page"]['end']) and len(datas) >= int(data["page"]['start']):
                    return datas[int(data["page"]['start']) - 1:int(data["page"]['end'])]
                else:
                    return datas[int(data["page"]['start']) - 1:]
            else:
                return []
        elif str(type(data['page'])) == '<class \'list\'>':
            return [database.data['music'][j - 1] for j in data['page']]

    except:
        return []


def save():
    f = open('data.json', 'w')
    f.write(dumps(database.data))
    f.close()


def load_save():
    f = open('data.json', 'r')
    database.data = loads(f.read())
    f.close()
    return database.data


def get_duration(file_path):
    tag = TinyTag.get(file_path)
    return tag.duration


def register_user(login, password):
    database.data['user'][login] = {
        'id': len(database.data['user']) + 1,
        "password hash": database.encode(password),
        'login hash': database.encode(login),
        'login': login,
        'name': '',
        'album': [],
        'music': [],
        'img': [],
        'date': str(datetime.now().strftime("%d.%m.%Y.%H.%M")),
        'description': '',
        'update hash': int(time())
    }
    return add_session(login)


def login_user(login, password):
    d = database.data['user'].get(login)
    if d:
        if database.examhash(d['password hash'], password) and database.examhash(d['login hash'], login):
            return add_session(login)
    return 'error'


def way_login_user(data):
    if 1:
        data = loads(data)
        return login_user(data['login'], data['password']) if (
            not data['login'] in database.data['user'].keys()) else 'error'
    else:
        return 'error'


def way_register_user(data):
    if 1:
        data = loads(data)
        return register_user(data['login'], data['password']) if (not data['login'] in database.data['user'].keys()) else login_user(data['login'], data['password'])
    else:
        return 'error'


def decode_cookie_login_user(cookie):
    login = cookie[256:]
    cookie = cookie[:256]
    password_hash, login_hash = [''.join([cookie[i * 2] for i in range(128)]),
                                 ''.join([cookie[i * 2 + 1] for i in range(128)])]
    return {'login': login, 'login_hash': login_hash, 'password_hash': password_hash}


def add_session(login):
    session = database.genkey(16)
    if database.data['session'].get(login):
        for i in list(database.data['session'].keys()).copy():
            if database.data['session'][i][1] <= int(time()) - 86400:
                del database.data['session'][i]
        database.data['session'][session] = (login, int(time()))
    else:
        database.data['session'][session] = (login, int(time()))
    return session


def exam_session(session):
    if database.data['session'].get(session):
        for i in list(database.data['session'].keys()).copy():
            if database.data['session'][i][1] <= int(time()) - 86400:
                del database.data['session'][i]
        return list(database.data['session'].get(session) or False)[0]
    else:
        return False


save()

load_save()
