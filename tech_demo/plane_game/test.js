var OBJLOADED = 0;
var OBJCOUNT = 0;

function objLoaded() {
    ++OBJLOADED;
    run.loading()
}

function addObjCount() {
    ++OBJCOUNT
}

function sgn(val) {
    return val ? val < 0 ? -1 : 1 : 0
}

function abc() {
    checkClick()
}

function foo() {
    alert("foo")
}

function bar() {
    alert("bar")
}
var run = function() {
    window.requestAnimFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
            window.setTimeout(callback, 1E3 / 60)
        }
    }();
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var XRES = c.width;
    var YRES = c.height;
    var MOUSX = 0;
    var MOUSY = 0;
    var MOUSXDIR = 0;
    var BSTATUS = 0;
    var SCRMODE = 2;
    var btnMenu = document.getElementById("btnMenu");
    var btnMusic = document.getElementById("btnMusic");
    this.showMenu = function() {
        menu.active = true
    };
    this.setMusic = function() {
        audio.click()
    };
    btnMenu.onclick = this.showMenu;
    btnMusic.onclick = this.setMusic;

    function loadImg(filename) {
        addObjCount();
        var img = new Image;
        img.onload = objLoaded;
        img.src = filename;
        return img
    }
    ctx.font = "22px Arial";
    var buffer = ctx.getImageData(0, 0, c.width, c.height - 50);
    var tileData = {};
    var img = new Image;
    var imgWidth = 0;
    var imgDataSize = 0;
    img.onload = function() {
        var sbuffer = document.createElement("canvas");
        sbuffer.width = img.width;
        sbuffer.height = img.height;
        var bctx = sbuffer.getContext("2d");
        imgWidth = img.width;
        imgDataSize = imgWidth * imgWidth * 4;
        bctx.drawImage(img, 0, 0);
        tileData = bctx.getImageData(0, 0, img.width, img.height).data;
        objLoaded()
    };
    addObjCount();
    if (SCRMODE === 2) img.src = "data/track2.png";
    else img.src = "data/track.png";
    var TILESET = loadImg("data/ui.png");
    var bg = loadImg("data/bg2.png");
    var player = {
        width: 64,
        height: 32
    };
    var racersImg = loadImg("data/racers2.png");
    var SCREEN_MIDX = c.width / 2;
    var ISMOBILE = !(window.orientation ===
        undefined);
    var KLEFT = 0;
    var KUP = 1;
    var KRIGHT = 2;
    var KDOWN = 3;
    var KSPACE = 4;
    var KCTRL = 5;
    var KSHIFT = 6;
    var KB = [0, 0, 0, 0, 0];
    var TCENTER = {
        x: -1,
        y: -1
    };
    var HNDTOUCH = new Array;
    for (var i = 0; i < 2; ++i) HNDTOUCH.push({
        active: 0,
        x: 0,
        y: 0
    });
    var CHK_POINTS = [{
            x: 1696 / SCRMODE,
            y: 544 / SCRMODE
        }, {
            x: 1504 / SCRMODE,
            y: 352 / SCRMODE
        }, {
            x: 1250 / SCRMODE,
            y: 352 / SCRMODE
        }, {
            x: 996 / SCRMODE,
            y: 610 / SCRMODE
        }, {
            x: 796 / SCRMODE,
            y: 610 / SCRMODE
        }, {
            x: 540 / SCRMODE,
            y: 360 / SCRMODE
        }, {
            x: 380 / SCRMODE,
            y: 400 / SCRMODE
        }, {
            x: 330 / SCRMODE,
            y: 600 / SCRMODE
        }, {
            x: 362 / SCRMODE,
            y: 1442 / SCRMODE
        },
        {
            x: 606 / SCRMODE,
            y: 1696 / SCRMODE
        }, {
            x: 864 / SCRMODE,
            y: 1696 / SCRMODE
        }, {
            x: 1052 / SCRMODE,
            y: 1504 / SCRMODE
        }, {
            x: 1252 / SCRMODE,
            y: 1504 / SCRMODE
        }, {
            x: 1420 / SCRMODE,
            y: 1696 / SCRMODE
        }, {
            x: 1620 / SCRMODE,
            y: 1640 / SCRMODE
        }, {
            x: 1696 / SCRMODE,
            y: 1504 / SCRMODE
        }
    ];

    function Item(x, y, xoffset, yoffset, w, h) {
        this.x = 0;
        this.y = 0;
        this.offsetX = xoffset;
        this.offsetY = yoffset;
        this.width = w;
        this.height = h;
        this.alive = 1;
        this.respawn = function(_x, _y) {
            this.x = _x;
            this.y = _y;
            this.alive = 1
        };
        this.collision = function(_x, _y) {
            if (!this.alive) return false;
            var dx = this.x - _x;
            var dy = this.y - _y;
            return Math.sqrt(dx * dx + dy * dy) < 6
        };
        this.draw = function(cosang, sinang, cx, cy) {
            if (SCRMODE === 1) {
                var space_z = 40;
                var scale_x = 300;
                var scale_y = 200;
                var horizon = -100
            } else {
                var space_z = 40;
                var scale_x = 240;
                var scale_y = 80;
                var horizon = 100
            }
            var obj_scale_x = 64 / SCRMODE;
            var obj_scale_y = 64 / SCRMODE;
            var obj_x = this.x - cx;
            var obj_y = this.y - cy;
            var d = Math.sqrt(obj_x * obj_x + obj_y * obj_y);

            var space_x = obj_x * cosang + obj_y * sinang;
            var space_y = -(obj_x * sinang) + obj_y * cosang;

            var screen_x = c.width / 2 + Math.ceil(scale_x / space_x * space_y);
            var screen_y = Math.ceil(space_z * scale_y / space_x) + horizon;

            var width = Math.ceil(32 * (obj_scale_x / space_x));
            var height = Math.ceil(32 * (obj_scale_y / space_x));

            if (width < 0 || height < 0) return;

            var ix = screen_x - width / 2;

            ctx.drawImage(racersImg, this.offsetX, this.offsetY - 2, 32, 30, ix, screen_y - height, width, height)
        }
    }

    function Racer(id) {
        this.x = 0;
        this.y = 0;
        this.ang = 0;
        this.offsetY = 32 * id;
        this.toPoint = 0;
        this.tx = 0;
        this.ty = 0;
        this.acc = 0;
        this.power = 1;
        this.maxSpeed = 1;
        this.targetAng = 0;
        this.lap = 0;
        this.lapdist = 0;
        this.TAU = Math.PI * 2;
        this.onPenalty =
            0;
        this.penaltyTime = 0;
        this.friction = 1;
        this.difficult = 0;
        this.setDifficult = function(isBehind) {
            var speed = isBehind ? .05 : -.05;
            var div = 64 / this.offsetY;
            this.difficult += speed * div;
            div /= 12;
            this.difficult = Math.max(Math.min(this.difficult, div), -div)
        };
        this.setOnPenalty = function() {
            this.onPenalty = 1;
            this.penaltyTime = 0
        };
        this.getDistance = function() {
            return this.lap + this.lapdist / 10
        };
        this.checkLap = function(midx, midy) {
            var dx = this.x - midx;
            var dy = midy - this.y;
            var at2 = (Math.atan2(dy, dx) + this.TAU) % (this.TAU + .05);
            if (at2 - this.lapdist <
                2)
                if (this.lapdist > this.TAU) {
                    this.lapdist = 0;
                    this.lap += 1;
                    return 1
                } else this.lapdist = Math.max(this.lapdist, at2)
        };
        this.setNextCoord = function() {
            var rnd = Math.random() * 6.28;
            this.tx = CHK_POINTS[this.toPoint].x + Math.cos(rnd) * 22;
            this.ty = CHK_POINTS[this.toPoint].y - Math.sin(rnd) * 22
        };
        this.getNextPoint = function() {
            this.toPoint = (this.toPoint + 1) % CHK_POINTS.length;
            this.setNextCoord()
        };
        this.getArcTan = function() {
            var dx = this.tx - this.x;
            var dy = this.y - this.ty;
            return Math.atan2(dy, dx)
        };
        this.distAchieved = function() {
            var dx =
                this.x - this.tx;
            var dy = this.ty - this.y;
            return dx * dx + dy * dy < 800
        };
        this.setNewAngle = function(newAng) {
            this.targetAng = (this.getArcTan() + Math.PI * 2) % (Math.PI * 2)
        };
        this.checkCoord = function() {
            var diff = this.targetAng - this.ang;
            this.ang += diff;
            if (this.distAchieved()) {
                this.acc *= .82;
                this.getNextPoint();
                this.setNewAngle()
            }
        };
        this.update = function(dt) {
            if (dt === 0) return;
            if (this.onPenalty) {
                this.penaltyTime += dt * 60;
                this.acc *= .96;
                if (this.penaltyTime > 11) {
                    this.onPenalty = 0;
                    this.friction = 1
                }
            }
            this.checkCoord();
            this.acc += dt * this.power;
            this.acc = Math.min(this.acc, this.maxSpeed + this.difficult);
            this.x += Math.cos(this.ang) * this.acc * 6;
            this.y -= Math.sin(this.ang) * this.acc * 6
        };
        this.setStartPos = function(sx, sy) {
            this.x = sx;
            this.y = sy;
            this.toPoint = 0;
            this.acc = 0;
            this.lap = 0;
            this.lapdist = 0;
            this.onPenalty = 0;
            this.penaltyTime = 0;
            this.friction = 1;
            this.difficult = 0;
            this.setNextCoord();
            this.setNewAngle(this.getArcTan());
            this.ang = this.targetAng
        };
        this.setSpecs = function(pow, mSpeed) {
            this.power = pow * .8;
            this.maxSpeed = mSpeed
        }
    }

    function Camera(sx, sy, ang) {
        this.x = sx;
        this.y =
            sy;
        this.angle = ang;
        this.space_z = 100;
        this.scale_x = 200;
        this.scale_y = 200;
        this.horizon = -50
    }
    var racer = new Array;
    for (var i = 0; i < 10; ++i) racer.push(new Racer(i + 1));

    function checkKey(key, pressed) {
        switch (key) {
            case 37:
                KB[KLEFT] = pressed;
                return;
            case 38:
                KB[KUP] = pressed;
                return;
            case 39:
                KB[KRIGHT] = pressed;
                return;
            case 40:
                KB[KDOWN] = pressed;
                return;
            case 32:
                KB[KSPACE] = pressed;
                return;
            case 16:
                KB[KSHIFT] = pressed;
                return;
            case 17:
                KB[KCTRL] = pressed;
                return;
            case 77:
                return
        }
    }
    window.onkeydown = function(e) {
        checkKey(e.keyCode, 1)
    };
    window.onkeyup =
        function(e) {
            checkKey(e.keyCode, 0)
        };

    function updateMousePos(x, y) {
        if (updateMousePos.reset === undefined) {
            updateMousePos.scx = 0;
            updateMousePos.scy = 0;
            updateMousePos.reset = function() {
                updateMousePos.r = c.getBoundingClientRect()
            };
            updateMousePos.getX = function(x) {
                updateMousePos.r = c.getBoundingClientRect();
                return (x - updateMousePos.r.left) * (c.width / resize.scaleX)
            };
            updateMousePos.getY = function(y) {
                updateMousePos.r = c.getBoundingClientRect();
                return (y - updateMousePos.r.top) * (c.height / resize.scaleY)
            };
            updateMousePos.reset();
            return
        }
        MOUSX = updateMousePos.getX(x);
        MOUSY = updateMousePos.getY(y)
    }

    function touchHandle(e, pressed) {
        e.preventDefault();
        updateMousePos(e.changedTouches[0].pageX, e.changedTouches[0].pageY)
    }
    c.addEventListener("mousemove", function(e) {}, false);
    c.addEventListener("touchmove", function(e) {
        for (var i = 0, xx = 0, id = 0; i < e.changedTouches.length; ++i) {
            if (i > 1) return;
            xx = updateMousePos.getX(e.touches[i].pageX);
            id = e.changedTouches[i].identifier;
            HNDTOUCH[id].x = xx;
            HNDTOUCH[id].y = updateMousePos.getY(e.touches[i].pageY)
        }
    }, false);

    function checkClick(x, y) {
        if (howToPlay.active) return
    }
    c.addEventListener("mousedown", function(e) {
        updateMousePos(e.clientX, e.clientY);
        BSTATUS = 1;
        checkClick()
    });
    c.addEventListener("touchstart", function(e) {
        e.preventDefault();
        for (var i = 0; i < e.changedTouches.length; ++i) {
            var id = e.changedTouches[i].identifier;
            HNDTOUCH[id].active = 1;
            MOUSX = HNDTOUCH[id].x = TCENTER.x = updateMousePos.getX(e.changedTouches[i].pageX);
            MOUSY = HNDTOUCH[id].y = TCENTER.y = updateMousePos.getY(e.changedTouches[i].pageY)
        }
        BSTATUS = 1;
        checkClick()
    });
    c.addEventListener("mouseup", function(e) {
        e.preventDefault();
        BSTATUS = 0
    });
    c.addEventListener("touchend", function(e) {
        e.preventDefault();
        for (var i = 0; i < e.changedTouches.length; ++i) {
            var id = e.changedTouches[i].identifier;
            HNDTOUCH[id].active = 0
        }
        BSTATUS = 0
    });

    function m7_4(cx, cy, cosang, sinang) {
        if (SCRMODE === 1) {
            var space_z = 40;
            var scale_x = 300;
            var scale_y = 200;
            var horizon = 1
        } else {
            var space_z = 40;
            var scale_x = 300;
            var scale_y = 100;
            var horizon = 1
        }
        var distance = 0;
        var tex = 0;
        var tx = 0;
        var ty = 0;
        var line_dx = 0;
        var line_dy = 0;
        var horizontal_scale =
            0;
        var space_x = 0;
        var space_y = 0;
        var si = 0;
        var MIDX = m7_4.skipX === 1 ? c.width / 2 : c.width / 4;
        for (var screen_y = 3; screen_y < 100; screen_y += m7_4.skipY) {
            distance = space_z * scale_y / (screen_y + horizon);
            horizontal_scale = distance / scale_x * m7_4.skipX;
            line_dx = -sinang * horizontal_scale;
            line_dy = cosang * horizontal_scale;
            space_x = cx + distance * cosang - MIDX * line_dx;
            space_y = cy + distance * sinang - MIDX * line_dy;
            for (var screen_x = 0; screen_x < c.width; screen_x += m7_4.skipX) {
                si = (screen_y * c.width + screen_x) * 4;
                ty = Math.floor(space_y);
                tx = Math.floor(space_x);
                if (!(tx < 0 || tx > imgWidth || (ty < 0 || ty > imgWidth))) {
                    tex = (ty * imgWidth + tx) * 4 % imgDataSize;
                    buffer.data[si + 0] = tileData[tex + 0];
                    buffer.data[si + 1] = tileData[tex + 1];
                    buffer.data[si + 2] = tileData[tex + 2];
                    buffer.data[si + 3] = tileData[tex + 3]
                } else {
                    buffer.data[si + 0] = 0;
                    buffer.data[si + 1] = 128;
                    buffer.data[si + 2] = 0;
                    buffer.data[si + 3] = 255
                }
                space_x += line_dx;
                space_y += line_dy
            }
        }
        ctx.putImageData(buffer, 0, 100)
    }

    function drawScrollingBg(angle) {
        var rot = angle * 35 % 320;
        var v = rot < 0 ? 640 : 320;
        ctx.drawImage(bg, (v + rot) % 320, 0, 320, 16, 0, 88, 320, 16)
    }

    function drawPlayer(dt,
        dir, shake) {
        if (drawPlayer.onPenalty === undefined) {
            drawPlayer.onPenalty = 0;
            drawPlayer.penaltyTime = 0;
            drawPlayer.setOnPenalty = function() {
                drawPlayer.onPenalty = 1;
                drawPlayer.penaltyTime = 0
            }
        }
        var ix = SCREEN_MIDX - 24;
        ctx.save();
        if (dir < 0 && !drawPlayer.onPenalty) {
            ctx.scale(-1, 1);
            ix = -SCREEN_MIDX - 24
        }
        if (drawPlayer.onPenalty) {
            drawPlayer.penaltyTime += dt * 60;
            if (drawPlayer.penaltyTime < 12) var offset = Math.floor(drawPlayer.penaltyTime) % 12 * 32;
            else drawPlayer.onPenalty = 0
        } else var offset = dir == 0 ? 0 : 32;
        ctx.drawImage(racersImg, offset,
            0, 32, 32, ix, c.height - 48 + shake * 3, 48, 48);
        ctx.restore()
    }

    function drawObj(angle, cosang, sinang, cx, cy, r, radius) {
        if (SCRMODE === 1) {
            var space_z = 40;
            var scale_x = 300;
            var scale_y = 200;
            var horizon = -100
        } else {
            var space_z = 40;
            var scale_x = 300;
            var scale_y = 100;
            var horizon = -100
        }
        var obj_scale_x = 65 / SCRMODE;
        var obj_scale_y = 125 / SCRMODE;
        var obj_x = r.x - cx;
        var obj_y = r.y - cy;
        var d = Math.sqrt(obj_x * obj_x + obj_y * obj_y);
        if (1) {
            var space_x = obj_x * cosang + obj_y * sinang;
            var space_y = -(obj_x * sinang) + obj_y * cosang;
            var screen_x = c.width / 2 + Math.ceil(scale_x /
                space_x * space_y);
            var screen_y = Math.ceil(space_z * scale_y / space_x) - horizon;
            var width = Math.ceil(player.width * (obj_scale_x / space_x));
            var height = Math.ceil(player.height * (obj_scale_y / space_x));
            if (width + 32 < 0 || height + 32 < 0) return;
            width = Math.min(width, 64);
            height = Math.min(height, 64);
            if (r.onPenalty) {
                var tilenum = Math.floor(r.penaltyTime) % 12;
                var ix = screen_x - width / 2;
                ctx.save()
            } else {
                var t = Math.round(r.ang / .2618) * .2618;
                var aa = Math.round(angle / .2618) * .2618;
                var rang = -t;
                var newAngle = rang - aa;
                var sinNewAngle = Math.sin(newAngle);
                var tilenum = Math.abs(Math.floor(newAngle / .2618) % 24);
                ctx.save();
                if (tilenum > 11) tilenum = 23 - tilenum;
                if (sinNewAngle < 0) {
                    ctx.scale(-1, 1);
                    var ix = -screen_x - width / 2
                } else var ix = screen_x - width / 2
            }
            ctx.drawImage(racersImg, 32 * tilenum, r.offsetY, 32, 32, ix, screen_y - height, width, height);
            ctx.restore()
        }
    }

    function resize() {
        if (resize.fscreen === undefined) {
            resize.fscreen = false;
            resize.scaleX = XRES;
            resize.scaleY = YRES;
            resize.scale = .75
        }
        var w = 0,
            h = 0;
        var gamediv = document.getElementById("game");
        var menudiv = document.getElementById("menu");
        var w = Math.min(window.innerWidth, 800);
        var h = document.body.clientHeight - menudiv.clientHeight;
        var originalHeight = h;
        if (h > w) {
            var ratio = w / h;
            h *= ratio;
            gamediv.style.height = ratio * 100 + "%"
        }
        if (w > h && h > 200) h *= 1 - Math.abs(h / w - 200 / 320);
        resize.scaleX = w;
        resize.scaleY = h;
        menudiv.style.marginTop = (originalHeight - h) * .5 + "px";
        c.style.width = w + "px";
        c.style.height = h + "px";
        gamediv.style.width = w + "px";
        gamediv.style.height = h + "px"
    }

    function collision(j) {
        var dx = 0,
            dy = 0,
            next = 0,
            dist = 0,
            cos = 0,
            sin = 0,
            ang = 0;
        for (var i = 0; i < 4; ++i) {
            if (i === j) continue;
            dx = racer[i].x - racer[j].x;
            dy = racer[i].y - racer[j].y;
            dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 12 / SCRMODE) {
                ang = Math.atan2(dy, dx);
                dist = dist / 2;
                cos = Math.cos(ang);
                sin = Math.sin(ang);
                racer[i].x += cos * dist;
                racer[i].y += sin * dist;
                racer[j].x += cos * -dist;
                racer[j].y += sin * -dist;
                racer[i].acc *= .8;
                racer[i].acc *= .8
            }
        }
    }

    function drawUI() {
        if (drawUI.lap === undefined) {
            drawUI.lap = 0;
            drawUI.pos = 0
        }
        drawUI.reset = function() {
            drawUI.lap = 0;
            drawUI.pos = 0
        };
        drawUI.menu = function() {};
        drawUI.number = function(n, x, y) {
            ctx.drawImage(TILESET, 13 * n, 240, 13,
                20, x, y, 13, 20)
        };
        var UIPOSLAPHEIGHT = 8;
        drawUI.position = function(p) {
            if (drawUI.pos !== p) drawUI.pos = p;
            ctx.drawImage(TILESET, 130, 240, 78, 20, 240, UIPOSLAPHEIGHT, 78, 20);
            drawUI.number(p + 1, 283, UIPOSLAPHEIGHT)
        };
        drawUI.currLap = function(l) {
            if (drawUI.lap !== l) drawUI.lap = Math.min(l, 9);
            ctx.drawImage(TILESET, 210, 240, 76, 20, 0, UIPOSLAPHEIGHT, 76, 20);
            drawUI.number(drawUI.lap, 42, UIPOSLAPHEIGHT)
        };
        drawUI.all = function() {
            drawUI.position(drawUI.pos);
            drawUI.currLap(drawUI.lap)
        }
    }
    window.addEventListener("resize", function() {
        resize()
    });
    window.addEventListener("orientationchange", function() {
        menu.active = 1
    }, false);

    function clearSky() {
        ctx.fillRect(0, 0, c.width, c.height);
        buffer = ctx.getImageData(0, 0, c.width, c.height - 50)
    }

    function menu() {
        if (menu.active === undefined) {
            menu.active = 0;
            menu.gfxdetails = 2;
            menu.screensize = 1;
            menu.draw = function() {
                ctx.drawImage(TILESET, 0, 25, 220, 150, 50, 40, 220, 150);
                ctx.drawImage(TILESET, 286, 240, 16, 16, 70 + 80 * menu.gfxdetails, 104, 16, 16)
            };
            menu.changingGFXDetails = function(dir) {
                menu.gfxdetails = Math.max(Math.min(menu.gfxdetails +
                    dir, 2), 0);
                m7_4.skipY = 3 - Math.max(menu.gfxdetails, 1);
                m7_4.skipX = 2 - Math.min(menu.gfxdetails, 1)
            };
            menu.changingScreenSize = function(dir) {
                menu.screensize = Math.max(Math.min(menu.screensize + dir, 2), 0);
                resize.scale = menu.screensize / 2;
                if (resize.scale === .5) resize.scale += .25
            };
            menu.checkOptions = function() {
                if (!BSTATUS) return 0;
                BSTATUS = 0;
                if (MOUSX > 115 && MOUSX < 200 && MOUSY > 65 && MOUSY < 85) {
                    menu.active = 0;
                    restartRace();
                    return
                }
                if (Math.abs(MOUSX - 58) < 20 || Math.abs(MOUSX - 260) < 20) {
                    if (MOUSX > XRES / 2 && Math.abs(MOUSY - 48) < 20) {
                        clearSky();
                        resize();
                        drawUI.all();
                        menu.active = 0;
                        return
                    }
                    if (Math.abs(MOUSY - 110) < 20 || Math.abs(MOUSY - 162) < 20) {
                        var dir = sgn(MOUSX - XRES / 2);
                        if (MOUSY < 144) menu.changingGFXDetails(dir);
                        else menu.changingScreenSize(dir)
                    }
                }
            };
            return 0
        }
        if (menu.active) {
            menu.draw();
            menu.checkOptions()
        }
        return menu.active
    }

    function howToPlay() {
        if (howToPlay.active === undefined) {
            howToPlay.active = 1;
            return 0
        }
        if (!howToPlay.active) return 0;
        ctx.drawImage(TILESET, 220, 25, 220, 150, 50, 40, 220, 150);
        if (BSTATUS) {
            BSTATUS = 0;
            if (Math.abs(MOUSX - 260) < 20 && Math.abs(MOUSY -
                    48) < 15 || Math.abs(MOUSX - 160) < 20 && Math.abs(MOUSY - 175) < 15) {
                howToPlay.active = 0;
                clearSky();
                drawUI.all();
                raceCountDown.reset();
                return 1
            }
        }
        return 1
    }

    function raceCountDown(dt) {
        if (raceCountDown.active === undefined) {
            raceCountDown.active = 1;
            raceCountDown.timing = -.25;
            raceCountDown.reset = function() {
                raceCountDown.active = undefined;
                raceCountDown.timing = -.25
            };
            return 0
        }
        if (!raceCountDown.active) return 0;
        raceCountDown.timing += dt / 1E3;
        var tile = Math.min(Math.max(Math.floor(raceCountDown.timing), 0), 3) * 21;
        ctx.drawImage(TILESET,
            395, 175 + tile, 45, 20, 130, 50, 45 * 1.5, 20 * 1.5);
        if (raceCountDown.timing >= 3) {
            if (raceCountDown.timing > 5) {
                ctx.fillRect(130, 50, 45 * 1.5, 20 * 1.5);
                raceCountDown.active = 0
            }
            return 0
        }
        return 1
    }

    function isEndRace() {
        if (isEndRace.finished === undefined) {
            isEndRace.finished = 0;
            isEndRace.cpuWon = 0;
            isEndRace.isWinnerSet = 0;
            isEndRace.setWinner = function(v) {
                isEndRace.isWinnerSet = 1;
                isEndRace.cpuWon = v
            };
            isEndRace.done = function() {
                isEndRace.finished = 1
            };
            isEndRace.reset = function() {
                isEndRace.finished = 0;
                isEndRace.cpuWon = 0;
                isEndRace.isWinnerSet =
                    0
            };
            return 1
        }
        if (!isEndRace.finished) return 0;
        if (BSTATUS) {
            BSTATUS = 0;
            if (Math.abs(MOUSX - 160) < 20 && Math.abs(MOUSY - 120) < 10) {
                restartRace();
                return 0
            }
        }
        ctx.drawImage(TILESET, 0, 175, 180, 65, 70, 70, 180, 65);
        ctx.drawImage(TILESET, 365, 13 * isEndRace.cpuWon, 75, 12, 125, 73, 75, 12);
        return 1
    }

    function audio() {
        if (audio.status === undefined) {
            audio.status = -1;
            audio.changed = 0;
            audio.showInfo = 0;
            audio.music = {};
            audio.click = function() {
                ++audio.status;
                switch (audio.status - 1) {
                    case 0:
                        btnMusic.style.display = "block";
                        audio.status = 1;
                        break;
                    case 1:
                        audio.music.loop =
                            1;
                        audio.music.play();
                        break;
                    case 2:
                        audio.music.pause();
                        break
                }
                btnMusic.innerText = audio.status - 1 == 1 ? "Music On" : "Music Off";
                if (audio.status > 2) audio.status = 1;
                audio.changed = 1
            };
            audio.loadAudio = function() {
                audio.music = new Audio("https://www.dropbox.com/s/gjurdw7syejc3qj/music2.ogg?dl=1");
                audio.music.addEventListener("loadeddata", function() {
                    audio.click()
                });
                audio.click()
            };
            audio.drawIcon = function() {
                if (audio.status < 0) return;
                btnMusic.style.display = "block"
            };
            audio.loadAudio();
            return 0
        }
        if (audio.showInfo) return 1;
        if (!audio.changed) return 0;
        if (audio.changed) audio.changed = 0
    }

    function normalize(v) {
        var l = Math.sqrt(v.x * v.x + v.y * v.y);
        v.x /= l;
        v.y /= l
    }

    function VIS() {
        this.cx = 0;
        this.cy = 0;
        this.ang = 0;
        this.vcount = 0;
        this.racer = new Array;
        this.sort = new Array;
        this.dir = {
            x: 0,
            y: 0
        };
        this.vector = {
            x: 0,
            y: 0
        };
        (function(c) {
            for (var i = 0; i < 3; ++i) {
                c.racer.push({
                    id: 0,
                    dx: 0,
                    dy: 0,
                    dist: 0
                });
                c.sort.push(0)
            }
        })(this);
        this.setCam = function(_x, _y, c, s, _ang) {
            this.cx = _x;
            this.cy = _y;
            this.ang = _ang;
            this.vcount = 0;
            this.dir.x = c;
            this.dir.y = s;
            normalize(this.dir);
            this.RAD45 =
                Math.PI / 180 * 120
        };
        this.findPlace = function(dist) {
            var place = 0;
            for (var i = 0, place = 0; i < this.vcount; ++i)
                if (dist < this.racer[this.sort[i]].dist) break;
            place = i;
            for (var i = this.vcount; i > place; --i) this.sort[i] = this.sort[i - 1];
            this.sort[place] = this.vcount;
            return this.vcount
        };
        this.addRacer = function(id, dist, dx, dy) {
            var place = this.findPlace(dist);
            this.racer[place].id = id;
            this.racer[place].dist = dist;
            this.racer[place].dx = dx;
            this.racer[place].dy = dy;
            ++this.vcount
        };
        this.dot = function(a, b) {
            return a.x * b.x + a.y * b.y
        };
        this.isVisible =
            function(id, x, y) {
                this.vector.x = x - this.cx;
                this.vector.y = y - this.cy;
                var dx = this.vector.x;
                var dy = this.vector.y;
                normalize(this.vector);
                var ang2 = Math.acos(this.dot(this.vector, this.dir));
                if (ang2 < this.RAD45) {
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    this.addRacer(id, dist, dx, dy)
                }
            }
    }

    function respawnItem(i) {
        var ang = Math.random() * 6.28;
        items[i].respawn(CHK_POINTS[i + 2].x + Math.cos(ang) * 20, CHK_POINTS[i + 2].y - Math.sin(ang) * 20)
    }

    function respawnAllItems() {
        for (var i = 0; i < 13; ++i) respawnItem(i)
    }
    var items = new Array;
    for (var i = 0; i < 13; ++i) {
        items.push(new Item(0,
            0, 0, 130, 32, 30));
        respawnItem(i)
    }

    function setRacers() {
        racer[0].setStartPos(1640 / SCRMODE, 1160 / SCRMODE);
        racer[0].setSpecs(.8, 1.16 / 2);
        racer[1].setStartPos(1750 / SCRMODE, 1220 / SCRMODE);
        racer[1].setSpecs(.8, 1.18 / 2);
        racer[2].setStartPos(1640 / SCRMODE, 1320 / SCRMODE);
        racer[2].setSpecs(.96, 1.19 / 2);
        cx = 1750 / SCRMODE;
        cy = 1370 / SCRMODE;
        pang = 270 * Math.PI / 180;
        pspeed = 0;
        friction = -1, friction2 = 1;
        racer[3].setStartPos(cx, cy)
    }

    function restartRace() {
        setRacers();
        raceCountDown.reset();
        isEndRace.reset();
        clearSky();
        drawUI.reset();
        drawUI.all()
    }
    var ot = 0;
    var cx = 1750 / SCRMODE;
    var cy = 1320 / SCRMODE;
    var pang = 270 * Math.PI / 180;
    var pspeed = 0;
    var friction = -1,
        friction2 = 1;

    function game(tim) {
        var dt = tim - ot;
        ot = tim;
        if (!isEndRace() && !howToPlay() && !menu() && !audio()) {
            dt = raceCountDown(dt) ? 0 : .0066;
            var f = KB[KUP] - KB[KDOWN];
            var dir = KB[KRIGHT] - KB[KLEFT];
            var MAXSPEED = (1.036 - .1 * Math.abs(dir)) / 2;
            if (f) pspeed += f * dt;
            else pspeed /= 1.02;
            if (drawPlayer.onPenalty) {
                friction2 = .94;
                dir = 0
            }
            pspeed = Math.max(-MAXSPEED, Math.min(pspeed, MAXSPEED)) * friction2;
            pang += dir * (1.23 - Math.abs(pspeed) /
                3) * pspeed * .04;
            var cosang = Math.cos(pang);
            var sinang = Math.sin(pang);
            var mx = cosang * 6 * pspeed;
            var my = sinang * 6 * pspeed;
            cx = Math.min(Math.max(16 - cosang * 16, cx + mx), imgWidth - (20 + cosang * 16));
            cy = Math.min(Math.max(16 - sinang * 16, cy + my), imgWidth - (20 + sinang * 16));
            var correctPlrPosX = cx - cosang * 32;
            var correctPlrPosY = cy - sinang * 32;
            m7_4(correctPlrPosX, correctPlrPosY, cosang, sinang);
            drawScrollingBg(pang);
            var texCol = (Math.round(cy + sinang * 32) * imgWidth + Math.round(cx + cosang * 32)) * 4 % imgDataSize;
            var color = tileData[texCol + 0];
            if (color ===
                67 || color === 233) friction2 = .96;
            else friction2 = 1;
            var newLap = 0;
            racer[3].x = cx + cosang * 16;
            racer[3].y = cy + sinang * 16;
            racer[3].acc = pspeed;
            game.vis.setCam(cx, cy, cosang, sinang, Math.atan2(sinang, cosang));
            for (var i = 0; i < 4; ++i) {
                if (i < 3) {
                    racer[i].update(dt);
                    game.vis.isVisible(i, racer[i].x, racer[i].y);
                    var wayPoint = racer[i].toPoint;
                    if (wayPoint >= 2 && wayPoint <= 15) {
                        wayPoint = Math.min(wayPoint - 2, 12);
                        for (var j = wayPoint; j >= Math.max(0, wayPoint - 1); --j)
                            if (items[j].collision(racer[i].x, racer[i].y)) {
                                racer[i].setOnPenalty();
                                items[j].alive =
                                    0
                            }
                    }
                }
                if (racer[i].checkLap(512, 512)) {
                    if (racer[i].lap > 9) {
                        if (!isEndRace.isWinnerSet) isEndRace.setWinner(i < 3);
                        if (i === 3) isEndRace.done()
                    }
                    if (i === 3) {
                        newLap = 1;
                        respawnAllItems();
                        drawUI.currLap(racer[i].lap)
                    }
                }
                collision(i)
            }
            cx = racer[3].x - cosang * 16;
            cy = racer[3].y - sinang * 16;
            pspeed = racer[3].acc;
            for (var i = 0; i < 13; ++i) {
                if (!items[i].alive) continue;
                if (items[i].collision(racer[3].x + cosang * 16, racer[3].y + sinang * 16)) {
                    drawPlayer.setOnPenalty();
                    items[i].alive = 0;
                    continue
                }
                items[i].draw(cosang, sinang, cx, cy)
            }
            var playerDrawed = 0;
            for (var i = game.vis.vcount - 1, id = 0; i >= 0; --i) {
                id = game.vis.sort[i];
                if (game.vis.racer[id].dist < 6 && !playerDrawed) {
                    playerDrawed = 1;
                    drawPlayer(dt, dir, Math.floor(tim) % 1.2 * pspeed - 6 * pspeed)
                }
                drawObj(pang, cosang, sinang, correctPlrPosX, correctPlrPosY, racer[game.vis.racer[id].id], 0)
            }
            if (!playerDrawed) drawPlayer(dt, dir, Math.floor(tim) % 1.2 * pspeed - 6 * pspeed);
            for (var i = 2, p = 0; i >= 0; --i) {
                var playerAhead = racer[3].getDistance() > racer[i].getDistance();
                if (newLap) racer[i].setDifficult(playerAhead);
                if (playerAhead) ++p
            }
            drawUI.position(3 -
                p);
            if (ISMOBILE) {
                KB[KUP] = KB[KDOWN] = KB[KLEFT] = KB[KRIGHT] = 0;
                for (var i = 0; i < HNDTOUCH.length; ++i)
                    if (HNDTOUCH[i].active) {
                        var dx = (HNDTOUCH[i].x - TCENTER.x) / 30;
                        KB[KUP] = 1;
                        if (Math.abs(dx) > .6) dx < 0 ? KB[KLEFT] = Math.abs(dx * .7) : KB[KRIGHT] = dx * .7
                    }
            } else;
        }
        requestAnimFrame(game)
    }
    run.loading = function() {
        ctx.fillStyle = "#FFF";
        ctx.fillText("Loading", c.width * .5 - 40, c.height * .5 - 10);
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(82, 102, 156, 12);
        if (OBJLOADED < OBJCOUNT) var ratio = 156 * (OBJLOADED / OBJCOUNT);
        else {
            audio();
            resize();
            ctx.fillStyle = "#444499";
            ctx.fillRect(0, 0, c.width, c.height);
            updateMousePos(0, 0);
            drawUI();
            m7_4.skipY = 1;
            m7_4.skipX = 1;
            game.vis = new VIS;
            game(0);
            raceCountDown();
            restartRace();
            return
        }
        ctx.fillStyle = "#DDDD00";
        ctx.fillRect(82, 102, ratio, 12)
    }
};