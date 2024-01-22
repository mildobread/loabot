MOBILE = "https://youtu.be/";
PC = "https://www.youtube.com/";

function _msg_script(url) {
    var apiUrl = "http://34.64.55.17:5000/yt/";
    var message = "";
    if (url.startsWith(MOBILE)) {
        apiUrl += url.split(MOBILE)[1].split("?")[0];
    }
    else if (url.startsWith(PC)) {
        apiUrl += url.split("?v=")[1];
    }
    else {
        message += "올바르지 않은 주소";
        return message;
    }
    message += getData(apiUrl);
    return message;
}

function _msg_serverAlive(url) {
    var apiUrl = "http://34.64.55.17:5000/";
    var message = getData(apiUrl);
    return message;
}

function getData(url) {
    var response = org.jsoup.Jsoup.connect(url)
        .header("accept", "application/json")
        .header("authorization", 'Bearer ' + "mildobread")
        .ignoreContentType(true)
        .ignoreHttpErrors(true)
        .timeout(250000)
        .execute()
    var statusCode = response.statusCode();
    if (statusCode >= 200 && statusCode < 300) {
        var result = JSON.parse(response.parse().text());
        var script = result['script'];
        return script;
    }
    else {
        message = "API Server is closed.\n";
        message += "Error Response - Status Code: " + statusCode + "\n";
        message += "Response Body: " + result;
        return message;
    }
}

module.exports = {
    msg_script: _msg_script,
    msg_serverAlive: _msg_serverAlive,
}