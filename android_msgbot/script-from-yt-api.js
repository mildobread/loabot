function _msg_script(url) {
    var apiUrl = "https://yt-script-ccbnl.run.goorm.io/yt/" + url;
    var data = getData(apiUrl);
    var results = JSON.parse(data);
    var message = result['script'];
    return message;
}

function getData(url) {
    var data = org.jsoup.Jsoup.connect(url)
        .header("accept", "application/json")
        .header("authorization", 'bearer ' + "mildobread")
        .ignoreContentType(true)
        .ignoreHttpErrors(true)
        .get().text();
    return data;
}

module.exports = {
    msg_script: _msg_script,
}