from flask import Flask, render_template, url_for, request, send_file, abort
from func import *
from os import listdir, path
app = Flask(__name__)
import mimetypes
print(mimetypes.types_map)
supported_formats_audio = [
    '.mp3',    # MPEG Audio Layer III (ID3 tags)
    '.ogg',    # Ogg Vorbis/Opus
    '.flac',   # Free Lossless Audio Codec
    '.wma',    # Windows Media Audio
    '.mp4',    # MPEG-4 Part 14 (AAC/ALAC)
    '.m4a',    # Apple Audio in MP4
    '.m4b',    # Audiobook format in MP4
    '.aiff',   # Audio Interchange File Format
    '.aif',    # AIFF (краткая версия)
    '.wav',    # Waveform Audio File Format (RIFF)
    '.dsf',    # DSD Stream File
    '.gsm',    # GSM 06.10 codec
    '.ape',    # Monkey's Audio
    '.ofr',    # OptimFROG
    '.wv'      # WavPack
]
@app.route('/')
def index():
    return render_template('index.html', header_type=exam_session(str(dict(request.cookies).get('session') or "0")))


@app.route('/login')
def login():
    return render_template('login.html') if (not exam_session(str(dict(request.cookies).get('session') or "0"))) else render_template('index.html', header_type=True)


@app.route('/register')
def register():
    return render_template('register.html') if (not exam_session(str(dict(request.cookies).get('session') or "0"))) else render_template('index.html', header_type=True)


@app.route('/profil')
def profil():
    #print(dict(request.cookies).get('session') or 0, database.data.get('session'))
    return render_template('profil.html') if (exam_session(str(dict(request.cookies).get('session') or "0"))) else abort(401)


@app.route('/create-album')
def create_album():
    return render_template('create-album.html')


@app.route('/upload')
def upload():
    #print(database.data['session'][str(dict(request.cookies)['session'])][0], database.data['user'][database.data['session'][str(dict(request.cookies)['session'])][0]]['album'], database.data['user'][database.data['session'][str(dict(request.cookies)['session'])][0]])
    return render_template('upload.html', name=database.data['user'][database.data['session'][str(dict(request.cookies)['session'])][0]]['album']) if (exam_session(str(dict(request.cookies).get('session') or "0"))) else abort(401)


@app.errorhandler(401)
def er401(error):
    return render_template('401.html', header_type=exam_session(str(dict(request.cookies).get('session') or "0"))), 401


@app.errorhandler(404)
def er404(error):
    return render_template('404.html', header_type=exam_session(str(dict(request.cookies).get('session') or "0"))), 404


@app.route('/api/cover/<int:idCover>')
def cover(idCover):
    if str(idCover).isdigit():
        for h in listdir('img'):
            if '.'.join(h.split('.')[:-1]) == str(idCover):
                try:
                    return send_file('img/' + str(h), mimetype='image/'+h.split('.')[-1])
                except:
                    continue
    return abort(404)


@app.route('/api/music/<int:idMusic>')
def music(idMusic):
    if str(idMusic).isdigit():
        for h in listdir('music'):
            if '.'.join(h.split('.')[:-1]) == str(idMusic):
                try:
                    return send_file('music/' + str(h), mimetype='audio/'+h.split('.')[-1])
                except:
                    continue
    return abort(404)

@app.route('/api/album/<int:idalbum>')
def album(idalbum):
    if str(idalbum).isdigit():
        for y in database.data['album']:
            if y['id'] == idalbum:
                return y
    return abort(404)

@app.route('/api/music', methods=['GET', 'POST'])
def api_music():
    if request.method == "POST":
        u = catolog_music(request.data.decode())
        if u:
            return {'result': u}
        else:
            return {'result': []}
    else:
        return {'message': 'not support GET requests'}

@app.route('/api/album', methods=['GET', 'POST'])
def api_album():
    if request.method == "POST":
        u = loads(request.data.decode())
        u = [database.data['album'][j - 1] for j in u]
        if u:
            return {'result': u}
        else:
            return {'result': []}
    else:
        return {'message': 'not support GET requests'}

@app.route('/api/register', methods=['GET', 'POST'])
def api_register():
    if request.method == "POST":

        u = way_register_user(request.data.decode())
        #print(u)
        if u:
            return {'result': {'cookie':u}}
        else:
            return {'result': 'error'}
    else:
        return {'message': 'not support GET requests'}


@app.route('/api/login', methods=['GET', 'POST'])
def api_login():
    if request.method == "POST":

        u = way_login_user(request.data.decode())
        #print(u)
        if u:
            return {'result': {'cookie':str(u)}}
        else:
            return {'result': 'error'}
    else:
        return {'message': 'not support GET requests'}

@app.route('/api/upload', methods=['GET', 'POST'])
def api_upload():
    if request.method == "POST":
        j = exam_session(str(dict(request.cookies).get('session') or "0"))
        if j:
            if 'image' in request.files and 'audio' in request.files and 'text' in request.form and 'description' in request.form:
                if request.files['image'] != '' and request.files['audio'] != '' and request.form['text'] != '' and request.form['description'] != '':
                    img_temp = request.files['image'].filename.split('.')[-1]
                    au_temp = request.files['audio'].filename.split('.')[-1]
                    y = str(len(database.data['music'])+1)
                    if '.'+au_temp in supported_formats_audio and str(mimetypes.types_map.get('.'+img_temp) or 'error/error').split('/')[0] == 'image':
                        with open('music/' + y + '.' + au_temp, 'wb') as ff: ff.write(request.files['audio'].read())
                        with open('img/' + y + '.' + img_temp, 'wb') as ff: ff.write(request.files['image'].read())
                        if request.form['album'].replace(':', '').isdigit():
                            album = list(map(int, request.form['album'].split(':')[1:]))
                        else:
                            album = []
                        u = {
                                'id': int(y),
                                'date': str(datetime.now().strftime("%d.%m.%Y.%H.%M")),
                                'durationSec': int(get_duration('music/' + y + '.' + au_temp) or 0),
                                'tag': [],
                                'album': album,
                                'listening': 0,
                                'comment': 0,
                                'author': database.data['user'][j]['name'],
                                'author_login': j,
                                'name': str(request.form['text']),
                                "description": str(request.form['description']),
                                'id music data': str(y)
                            }
                        database.data['music'].append(u)
                        return u
                    else:
                        return {'message': 'Wrong file formats were used'}
                else:
                    return {'message': 'The form is not fully filled'}
            else:
                return {'message': 'The form is not fully filled'}
        else:
            return {'message': 'The user is not authorized'}
    else:
        return {'message': 'not support GET requests'}

@app.route('/favicon.ico')
def favicon():
    return 'error', 404

if __name__ == '__main__':
    app.run(port=5000)
