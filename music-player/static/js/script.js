let music;

function isElementVisible(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function getParent(el) {
    if (el.parentElement) {
        return el.parentElement;
    }

    if (el.parentNode) {
        return el.parentNode;
    }

    return null;
}

function button(img, music, name, artist, duration, id) {
    return `<div class="song-card result-item" onclick="newMusic(${music});player_bar('${artist}', '${name}', ${duration})">
            <div class="album-art">
                <div class="wave-animation">${id}</div>
                <img src="api/cover/${img}" loading="lazy" alt="" style="z-index: 10">
            </div>
            <h3 style="margin: 0.5em">${name}</h3>
            <p class="artist" style="margin: 0.5em">${artist}</p>
            <p class="duration" style="margin: 0.5em">${String(Math.floor(duration / 60)) + ':' + String(duration % 60).padStart(2, '0')}</p>
        </div>`;
}

function button_album(img, music, name, artist, id) {
    return `
    <div class="song-card result-item" onclick="newAlbum(${id});togglePlaylistModal();">
        <div class="album-art">
            <div class="wave-animation">${id}</div>
            <img src="api/cover/${img}" loading="lazy" alt="" style="z-index: 10">
        </div>
        <h3 style="margin: 0.5em">${name}</h3>
        <p class="artist" style="margin: 0.5em">${artist}</p>
        <p class="album-meta" style="margin: 0.5em;font-size: 80%;padding-left: 0.1em">${music} треков</p>
    </div>
    `
}

function button_album2(img, music, name, artist, id, onclick) {
    return `
    <div class="song-card result-item" onclick="${onclick}">
        <div class="album-art">
            <div class="wave-animation">${id}</div>
            <img src="api/cover/${img}" loading="lazy" alt="" style="z-index: 10">
        </div>
        <h3 style="margin: 0.5em">${name}</h3>
        <p class="artist" style="margin: 0.5em">${artist}</p>
        <p class="album-meta" style="margin: 0.5em;font-size: 80%;padding-left: 0.1em">${music} треков</p>
    </div>
    `
}

function update_load_music() {
    let n = document.getElementsByClassName('song-card result-item');
    if (n) {
        if (isElementVisible(n[n.length - 1])) {
            let data_http = {
                "page": {"start": n.length + 1, "end": n.length + 12},
                "durationSec": {"min": 0, "max": -1},
                "tag": [],
                "search": "",
                "sorted": ""
            };
            up_catolog(url, data_http);
        }
    }
}

function get_basket() {
    let y = getCookie('basket');
    let oo = {};
    let u;
    if (!(y)) {
        return null;
    } else {
        y = y.split('-');
        for (let i = 0; i < y.length; i++) {
            u = y[i].split('~');
            oo[parseInt(u[0], 36)] = parseInt(u[1], 36);
        }
        delete oo[''];
        delete oo[0];
        return oo;
    }
}

function set_basket(y) {
    let u = Object.keys(y);
    y = Object.values(y);
    let g = '';
    for (let i = 0; i < u.length; i++) {
        g = g + u[i].toString(36) + "~" + y[i].toString(36) + "-";
    }
    g = g.slice(0, -1);
    document.cookie = 'basket=' + g;
}

function set_basket_update(y, el) {
    el = getParent(el);
    let h = Number(el.innerHTML.split('(get_basket(), ')[1].split(')')[0])
    el.innerHTML = button('', '', '', '', '', '', y[h], [`set_basket_update(change_plys_basket(get_basket(), ${h}), this)`, `set_basket_update(change_minus_basket(get_basket(), ${h}), this)`, `set_basket_update(change_plys_basket(get_basket(), ${h}), this)`], true);
    set_basket(y);
}

function change_basket(obj, do_, to_) {
    obj[do_] = to_;
    return obj;
}

function mpause(ob) {
    ob.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" style="fill:white; width: 80%;height: auto;" viewBox="0 0 24 24" width="1em" height="1em"><path d="M6.5,0A3.5,3.5,0,0,0,3,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,6.5,0Z"/><path d="M17.5,0A3.5,3.5,0,0,0,14,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,17.5,0Z"/></svg>';
    ob.className = 'filter-pill active';
    ob.setAttribute("onclick", 'mplay(this)')
    music.pause();
}

function mplay(ob) {
    ob.innerHTML = '▶';
    ob.className = 'filter-pill';
    ob.setAttribute("onclick", 'mpause(this)')
    music.play();
}

function player_bar_data(artist, name, duration) {
    return `<div class="player-container" style="z-index: 1000;">
        <div class="player-controls">
            <div class="player-progress">
                
                <button class="filter-pill" style="color: white" onclick="music.currentTime -= 10"><svg style="fill:white;" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M0.9927 2C1.545 2 1.9927 2.4477 1.9927 3C1.9927 3.7913 1.9927 4.5827 1.9927 5.374C7.0952 -2.3265 18.6203 -1.6156 22.7379 6.6535C25.8819 12.9677 22.9281 20.6187 16.3567 23.182C16.2405 23.2268 16.1172 23.2498 15.9927 23.25C15.2229 23.2512 14.7405 22.4186 15.1243 21.7513C15.2381 21.5536 15.4161 21.4007 15.6287 21.318C22.8086 18.5417 24.2906 9.034 18.2962 4.2041C13.5143 0.3512 6.4217 1.6785 3.3567 7C4.2353 7 5.114 7 5.9927 7C6.7625 7 7.2436 7.8333 6.8587 8.5C6.6801 8.8094 6.3499 9 5.9927 9C4.9927 9 3.9927 9 2.9927 9C1.3358 9 -0.0073 7.6569 -0.0073 6C-0.0073 5 -0.0073 4 -0.0073 3"/><path d="M9.981 14.9956C8.3241 14.9956 6.981 16.3388 6.981 17.9956C6.981 18.9956 6.981 19.9956 6.981 20.9956C6.981 23.305 9.481 24.7484 11.481 23.5937C12.4092 23.0578 12.981 22.0674 12.981 20.9956C12.981 19.9956 12.981 18.9956 12.981 17.9956C12.981 16.3388 11.6378 14.9956 9.981 14.9956ZM10.981 20.9956C10.981 21.7654 10.1476 22.2465 9.481 21.8616C9.1716 21.683 8.981 21.3529 8.981 20.9956C8.981 19.9956 8.981 18.9956 8.981 17.9956C8.981 17.2258 9.8143 16.7447 10.481 17.1296C10.7904 17.3082 10.981 17.6383 10.981 17.9956"/><path d="M4.364 15.0716C3.9902 14.9168 3.5599 15.0024 3.274 15.2886C2.274 16.2886 1.274 17.2886 0.274 18.2886C-0.2608 18.8423 0.0043 19.7673 0.7513 19.9536C1.0859 20.0371 1.4399 19.9422 1.688 19.7026C2.119 19.2716 2.55 18.8406 2.981 18.4096C2.981 19.9383 2.981 21.4669 2.981 22.9956C2.981 23.7654 3.8143 24.2465 4.481 23.8616C4.7904 23.683 4.981 23.3529 4.981 22.9956C4.981 20.6623 4.981 18.3289 4.981 15.9956"/><path d="M10.9927 12C10.9927 10.3333 10.9927 8.6667 10.9927 7C10.9927 6.2302 11.826 5.7491 12.4927 6.134C12.8021 6.3126 12.9927 6.6427 12.9927 7C12.9927 8.3333 12.9927 9.6667 12.9927 11C13.9927 11 14.9927 11 15.9927 11C16.7625 11 17.2436 11.8333 16.8587 12.5C16.6801 12.8094 16.3499 13 15.9927 13C14.6593 13 13.326 13 11.9927 13"/></svg></button>
                <button class="filter-pill" style="color: white;font-size:1.5em;width: 3.2em;height: 2em;text-align: center;vertical-align: center" onclick='mpause(this);' id="butp">▶</button>
                <button class="filter-pill" style="color: white;margin-right: 0.8em" onclick="music.currentTime += 10"><svg style="fill:white;" xmlns="http://www.w3.org/2000/svg" width="2em" height="2em"><path d="m21 15a3 3 0 0 0 -3 3v3a3 3 0 0 0 6 0v-3a3 3 0 0 0 -3-3zm1 6a1 1 0 0 1 -2 0v-3a1 1 0 0 1 2 0z"/><path d="m13 12v-5a1 1 0 0 0 -2 0v4h-3a1 1 0 0 0 0 2h4a1 1 0 0 0 1-1z"/><path d="m23 2a1 1 0 0 0 -1 1v2.374a12 12 0 1 0 -14.364 17.808 1.015 1.015 0 0 0 .364.068 1 1 0 0 0 .364-1.932 10 10 0 1 1 12.272-14.318h-2.636a1 1 0 0 0 0 2h3a3 3 0 0 0 3-3v-3a1 1 0 0 0 -1-1z"/><path d="m15.383 15.076a1 1 0 0 0 -1.09.217l-3 3a1 1 0 0 0 1.414 1.414l1.293-1.293v4.586a1 1 0 0 0 2 0v-7a1 1 0 0 0 -.617-.924z"/></svg></button>
                <div class="progress-container">
                    <span style="position: absolute;top: -1.2em">${artist} - ${name}</span>
                    <input type="range"
                           class="progress-bar"
                           min="0"
                           max="${duration}"
                           value="0"
                           aria-label="Прогресс трека"
                           onchange="music.currentTime = this.value;"
                           id="range_time">
                    <div class="progress-fill"></div>
                </div>
                <span class="time" id="time">0:00</span>
            </div>
        </div>
    </div>`
}

function st() {
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const element = document.getElementById('range_time')
    let isActive = false;

// Активация при нажатии мыши или касании
    element.addEventListener('mousedown', () => isActive = true);
    element.addEventListener('touchstart', () => isActive = true);

// Деактивация при отпускании мыши, уходе курсора или завершении касания
    element.addEventListener('mouseup', () => isActive = false);
    element.addEventListener('mouseleave', () => isActive = false);
    element.addEventListener('touchend', () => isActive = false);
    element.addEventListener('touchcancel', () => isActive = false);

    progressBar.addEventListener('input', (e) => {
        progressFill.style.width = `${(e.target.value / e.target.max) * 100}%`;
        document.getElementById('time').innerText = String(Math.floor(e.target.value / 60)) + ':' + String(e.target.value % 60).padStart(2, '0');
    });
    music.addEventListener('timeupdate', () => {
        let yt = document.getElementById('range_time');
        if (!isActive) {
            yt.value = music.currentTime;
            progressFill.style.width = `${(yt.value / yt.max) * 100}%`;
            document.getElementById('time').innerText = String(Math.floor(yt.value / 60)) + ':' + String(yt.value % 60).padStart(2, '0');
        }
    });
    music.addEventListener('ended', () => {
        mplay(document.getElementById('butp'))
    })
}

function player_bar(artist, name, duration) {
    document.getElementById('player').innerHTML = player_bar_data(artist, name, duration);
    st();
}

function change_plys_basket(obj, do_) {
    if (obj[do_] == null) {
        obj[do_] = 0;
    }
    obj[do_] = obj[do_] + 1;
    return obj;
}

function change_minus_basket(obj, dos) {
    if (obj[dos] == 0) {
        return obj;
    }
    obj[dos] = obj[dos] - 1;
    return obj;
}

function getCookie(name) {
    const fullCookieString = '; ' + document.cookie;
    const splitCookie = fullCookieString.split('; ' + name + '=');
    return splitCookie.length === 2 ? splitCookie.pop().split(';').shift() : null;
}

function newMusic(mid) {
    if (music) {
        music.pause();
    }

    music = new Audio(document.location['origin'] + '/api/music/' + String(mid));
    music.play();
}

function album_carts(img, name, artist, duration) {
    return `
    <div class="track-item">
        <img src="api/cover/${img}" alt="" loading="lazy"
             style="position: absolute; width: 5em; left: 24.8em; border-radius: 0.5em;">
        <div class="track-info">
            <span class="track-title">${name}</span>
            <span class="track-artist">${artist}</span>
        </div>
        <span class="track-duration">${String(Math.floor(duration / 60)) + ':' + String(duration % 60).padStart(2, '0')}</span>
        <div class="active-indicator"></div>
    </div>
    `
}

function newAlbum(mid) {

    let url = document.location['origin'] + '/api/album/' + mid;

    function jji(data) {
        console.log(data);
        let h = document.getElementById('playlist_list')
        h.innerHTML = ''
        for (let i = 0; i < data.length; i++) {
            h.innerHTML = h.innerHTML + album_carts(data[i]['id music data'], data[i]['name'], data[i]['author'], data[i]['durationSec'])
        }
        kk()
        //togglePlaylistModal()
    }

    function iu(data) {
        console.log(data);
        document.getElementById('name_playlist').innerHTML = 'Плейлист ' + data['author'] + ' - ' + data['name'];
        let data_http = {
            "page": data['music']
        };
        let url = document.location['origin'] + '/api/music';
        let ui = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data_http)
        };
        fetch(url, ui)
            .then((response) => response.json())
            .then((datas) => {
                    jji(datas['result'])
                }
            );
    }

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
                iu(data)
            }
        );
}

function up_catolog(url, uuuu) {
    let ui = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(uuuu)
    };

    function iu(data) {
        console.log(data)
        if (data.length <= 11) {
            window.removeEventListener('scroll', update_load_music);
        }
        let jjj = document.getElementById('catolog');
        let mincat = document.getElementsByClassName('song-card result-item').length + 1
        for (let i = 0; i < data.length; i++) {
            if (data[i]['id'] >= mincat) {
                jjj.innerHTML = jjj.innerHTML + button(data[i]['id music data'], data[i]['id music data'], data[i]['name'], data[i]['author'], data[i]['durationSec'], data[i]['id']);
            }
        }
        jjj.innerHTML = jjj.innerHTML + button_album(1, 3, 'Группа крови', 'КИНО', 1);
    }

    fetch(url, ui)
        .then((response) => response.json())
        .then((data) => {
                iu(data['result'])
            }
        );
}

function radio_filter_activ(ob) {
    if (ob.className == 'filter-pill') {
        let k = document.getElementsByClassName('filter-pill active');
        for (let i = 0; i < k.length; i++) {
            k[i].className = 'filter-pill'
        }
        ob.className = 'filter-pill active';
        console.log(ob.innerText)
    }
}

