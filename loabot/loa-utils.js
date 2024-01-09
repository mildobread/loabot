function _drawImage(user_name, url, imageType) {
    txt = user_name;
    size = 40;
    con = new java.net.URL(url).openConnection();
    con.setDoInput(true);
    con.setConnectTimeout(3000);
    con.setReadTimeout(5000);
    bmp = android.graphics.BitmapFactory.decodeStream(con.getInputStream());
    con.disconnect();
    img = bmp.copy(Bitmap.Config.ARGB_8888, true);
    can = new Canvas(img);
    bounds = new Rect();
    paint = new Paint();
    paint.setTextSize(size);
    paint.setAntiAlias(true);
    paint.getTextBounds(txt,0,txt.length,bounds);
    paint.setARGB(255,255,255,255); // 흰색
    paint2 = new Paint();
    paint2.setStyle(Paint.Style.STROKE);
    paint2.setStrokeWidth(3);
    paint2.setARGB(255,0,0,0);
    paint2.setTextSize(size);
    paint2.setAntiAlias(true);
    if (imageType == CHARACTER_TYPE) {
        can.drawText(txt,(can.width-bounds.width())/2,(can.height-bounds.height())/10,paint2);
        can.drawText(txt,(can.width-bounds.width())/2,(can.height-bounds.height())/10,paint);
    }
    bytearrayoutputstream = new java.io.ByteArrayOutputStream();
    img.compress(Bitmap.CompressFormat.JPEG, 100, bytearrayoutputstream);
    bytearray = bytearrayoutputstream.toByteArray();
    imgb64 = java.util.Base64.getEncoder().encodeToString(bytearray);
    d = {"image":imgb64,"title":"title"};
    r = org.jsoup.Jsoup.connect("https://a.mildo.workers.dev/s")
            .header("Content-Type", "application/json")
            .header("Accept", "text/plain")
            .followRedirects(true)
            .ignoreHttpErrors(true)
            .ignoreContentType(true)
            .method(org.jsoup.Connection.Method.POST)
            .maxBodySize(1000000*30)
            .requestBody(JSON.stringify(d))
            .timeout(0)
            .execute();
    res = 'https://a.mildo.workers.dev/e/' + r.body();
    return res;
}

function _character_image(user_name) {
    var url = "https://developer-lostark.game.onstove.com/armories/characters/" + user_name + "/profiles";
    var data = getData(url);
    var message = "";
    if (data == 'null') {
        return message;
    }
    else {
        var results = JSON.parse(data);
        if (results['CharacterImage'] == null) {
            return null;
        }
        else {
            message += _drawImage(user_name, results['CharacterImage'], CHARACTER_TYPE);
        }
    }
    return message;
}

function _event_image() {
    var url = "https://developer-lostark.game.onstove.com/news/events"
    var data = getData(url);
    var message = "";
    if (data == 'null') {
        message += 'null\n';
    }
    else {
        var results = JSON.parse(data);
        message += _drawImage("", results[0]['Thumbnail'], EVENT_TYPE);
    }
    return message;
}

function getData(url) {
    var data = org.jsoup.Jsoup.connect(url)
    .header("accept", "application/json")
    .header("authorization", 'bearer ' + LOA_API_KEY)
    .ignoreContentType(true)
    .ignoreHttpErrors(true)
    .get().text();
    return data;
}

module.exports = {
    drawImage: _drawImage,
    character_image: _character_image,
    event_image: _event_image
}