function _msg_script(url) {
    var apiUrl = "https://yt-script-ccbnl.run.goorm.site/yt/" + url;
    var message = getData(apiUrl);
    return message;
}

function _msg_serverAlive(url) {
    var apiUrl = "https://yt-script-ccbnl.run.goorm.site/";
    var message = getData(apiUrl);
    return message;
}

function getData(url) {
    var response = org.jsoup.Jsoup.connect(url)
        .header("accept", "application/json")
        .header("authorization", 'Bearer ' + "mildobread")
        .ignoreContentType(true)
        .ignoreHttpErrors(true)
        .get().text()
    var result = JSON.parse(response);
    var script = result['script'];
    return script;
}

module.exports = {
    msg_script: _msg_script,
    msg_serverAlive: _msg_serverAlive,
}