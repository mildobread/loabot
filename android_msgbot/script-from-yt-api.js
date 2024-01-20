function _msg_script(url) {
    var apiUrl = "https://yt-script-ccbnl.run.goorm.site/yt/" + url;
    var data = getData(apiUrl);
    java.lang.Thread.sleep(100);
    var result = JSON.parse(data);
    var script = result['script'];
    //return script;
    message = "";
    if (script == 'null') {
        message += "Subtitles are disabled for this video";
    }
    else {
        message += gptApi.msg_gptSummaryScript(script)
    }
    return message;
}

function getData(url) {
    var data = org.jsoup.Jsoup.connect(url)
        .header("accept", "application/json")
        .header("authorization", 'Bearer ' + "mildobread")
        .ignoreContentType(true)
        .ignoreHttpErrors(true)
        .get().text();
    return data;
}

module.exports = {
    msg_script: _msg_script,
}