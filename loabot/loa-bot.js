importPackage(android.graphics);

const API_KEY = "";
const GPT_API_KEY = "";
const NAVER_CID = ""
const NAVER_CSC = ""

const CHARACTER_TYPE = 0;
const EVENT_TYPE = 1;
let chatList = {}; // 대화 내용 저장
let totalToken = 0; // 토큰 사용량

function onNotificationPosted(sbn, sm) {
    var packageName = sbn.getPackageName();
    if (!packageName.startsWith("com.kakao.tal")) return;
    var actions = sbn.getNotification().actions;
    if (actions == null) return;
    var userId = sbn.getUser().hashCode();
    for (var n = 0; n < actions.length; n++) {
        var action = actions[n];
        if (action.getRemoteInputs() == null) continue;
        var bundle = sbn.getNotification().extras;

        var msg = bundle.get("android.text").toString();
        var sender = bundle.getString("android.title");
        var room = bundle.getString("android.subText");
        if (room == null) room = bundle.getString("android.summaryText");
        var isGroupChat = room != null;
        if (room == null) room = sender;
        var replier = new com.xfl.msgbot.script.api.legacy.SessionCacheReplier(packageName, action, room, false, "");
        var icon = bundle.getParcelableArray("android.messages")[0].get("sender_person").getIcon().getBitmap();
        var image = bundle.getBundle("android.wearable.EXTENSIONS");
        if (image != null) image = image.getParcelable("background");
        var imageDB = new com.xfl.msgbot.script.api.legacy.ImageDB(icon, image);
        com.xfl.msgbot.application.service.NotificationListener.Companion.setSession(packageName, room, action);
        if (this.hasOwnProperty("responseFix")) {
            try {
                responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName, userId != 0);
            }
            catch (error) {
                replier.reply(error);
                replier.reply(error.stack);
            }
        }
    }
}

let functionList = {
    naverSearchLocal: function(query) {
        let response = org.jsoup.Jsoup.connect("https://openapi.naver.com/v1/search/local.json?query=" + query + "&display=5&sort=random")
          .header('X-Naver-Client-Id', NAVER_CID)
          .header('X-Naver-Client-Secret', NAVER_CSC)
          .ignoreContentType(true)
          .ignoreHttpErrors(true)
          .get().text();
        response = JSON.parse(response); // JSON.stringify(response)
        let message = "";
        let searchListLength = response["items"].length;
        let index = Math.floor(Math.random() * (searchListLength + 1));
        let spot = response["items"][index];
        message += spot["title"] + '\n';
        message += spot["category"] + '\n';
        message += spot["address"] + '\n';
        message += "위치: https://m.map.naver.com/search2/search.naver?query=" + spot["address"].replace(/ /g, '%20');
        return message;
    }
};

var msgList_1 = [];

function responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName, isMultiChat) {
    // GPT
    if (msg.startsWith("!밀도야 ")) {
        var prompt = msg.substr(5);
        replier.reply(msg_getChatGPTResponse(prompt));
        return;
    }

    if (msg.startsWith("/")) {
        var prompt = msg.substr(1);
        var message = msg_getChatGPTFunctionCalling(prompt)
        //var message = functionList["naverSearchLocal"](prompt);
        replier.reply(message);
        return;
    }

    if(room == "akd") {
        msgList_1.push(sender + " : " + msg);
        if(msgList_1.length >= 100) {
            msgList_1.shift();
        }
        if(msg == "!요약") {
            replier.reply("요약중...");
            var content = msg_gptSummary(msgList_1.join("\n"), "This is a conversation from a KakaoTalk chat room. The left side shows the person speaking, and the right side shows the message they sent. Please summarize the important parts of this conversation in less than 300 characters. to korean", 300, sender);
            replier.reply("대화내용 요약" + "\u200b".repeat(500) + "\n\n" + content);
            return;
        }
    }

    cmd = msg.split(" ");
    if (cmd[0][0] != '!') return;

    // Type: "!Commnad"
    if (cmd.length == 1) {
        switch (cmd[0]) {
            case "!도움말":
                message = msg_help();
                break;
            case "!주사위":
                message = msg_dice();
                break;
            case "!전카팩":
                message = msg_legendCard1();
                break;
            case "!심연":
                message = msg_legendCard2();
                break;
            case "!결속":
                message = msg_legendCard3();
                break;
            case "!보석시세":
                message = msg_gemPrice();
                break;
            case "!강화재료":
                message = msg_enhanceIngredient();
                break;
            case "!이벤트":
                cimg = event_image();
                if (cimg != null) {
                    replier.reply(cimg)
                }
                message = msg_event();
                break;
            default:
                message = msg_nullCmd();
                break;
        }
    }
    // Type: "/Commnad ID"
    else if (cmd.length == 2) {
        switch (cmd[0]) {
            case "!장비":
                message = msg_equip(cmd[1]);
                break;
            case "!정보":
                cimg = character_image(cmd[1]);
                if (cimg != null) {
                    replier.reply(cimg)
                }
                message = msg_profile(cmd[1]);
                break;
            case "!보석":
                message = msg_gem(cmd[1]);
                break;
            case "!부캐":
                message = msg_expedition(cmd[1]);
                break;
            case "!내실":
                message = msg_foundation(cmd[1]);
                break;
            case "!주급":
                message = msg_salary(cmd[1]);
                break;
            case "!날씨":
                message = msg_weather(cmd[1])
                break;
            case "!운세":
                message = msg_destiny(cmd[1])
                break;
            default:
                message = msg_nullCmd();
                break;
        }
    }
    else {
        message = msg_nullCmd();
    }
    replier.reply(message);
}

function naverSearchLocal(query) {
    let response = org.jsoup.Jsoup.connect("https://openapi.naver.com/v1/search/local.json?query=" + query + "&display=5&sort=random")
      .header('X-Naver-Client-Id', NAVER_CID)
      .header('X-Naver-Client-Secret', NAVER_CSC)
      .ignoreContentType(true)
      .ignoreHttpErrors(true)
      .get().text();
      response = JSON.parse(response); // JSON.stringify(response)
    let message = "";
    let searchListLength = response["items"].length;
    let index = Math.floor(Math.random() * (searchListLength + 1));
    let spot = response["items"][index];
    message += spot["title"] + '\n';
    message += spot["category"] + '\n';
    message += spot["address"] + '\n';
    message += "지도 정보: https://m.map.naver.com/search2/search.naver?query=" + spot["address"].replace(/ /g, '%20');
    return message;
}

function msg_gptSummary(msg, prompt, token, sender) {
    if (!(sender in chatList)) chatList[sender] = [{role: "system", content:prompt}];

    chatList[sender].push({role: "user", content: msg});
    let response;

    let data = {
        "model": "gpt-3.5-turbo",
        "messages": chatList[sender], 
        "max_tokens": token
    }

    try {
        response = org.jsoup.Jsoup.connect("https://api.openai.com/v1/chat/completions")
        .header("Content-Type", "application/json")
        .header("Authorization", "Bearer " + GPT_API_KEY)
        .requestBody(JSON.stringify(data)).ignoreHttpErrors(!0)
        .ignoreContentType(!0)
        .post().wholeText()
        .trim()
        .replace(/\x00/g,'');
        response = JSON.parse(response);
        let message = response.choices[0].message;
        chatList[sender].push(message);
        return message.content;
    } catch (e) {
        Log.e(e + "\n" + JSON.stringify(response, null, 2));
        return '오류!';
    }
}

function msg_salary(user_name) {
    var url = "https://developer-lostark.game.onstove.com/characters/" + user_name + "/siblings";
    var data = getData(url);
    var message = "";
    if (data == 'null') {
        message += 'null\n';
    }
    else {
        var results = JSON.parse(data);
        message += "[" + user_name + " 주급]\n";
        var sum = 0;
        for (let i = 0; i < results.length; i++) {
            var character = results[i];
            var level = character['ItemAvgLevel'].split(",")[0] + character['ItemAvgLevel'].split(",")[1];
            sum += getSalary(Number(level));
            var character_salary = getSalary(Number(level)).toString();
            message += character['CharacterName'] + ": " + character_salary + "G\n";
        }
        message += "합계: " + sum.toString() + "G"
    }
    return message;
}

function msg_expedition(user_name) {
    var url = "https://developer-lostark.game.onstove.com/characters/" + user_name + "/siblings";
    var data = getData(url);
    var message = "[원정대 정보]\n";
    if (data == 'null') {
        message += 'null\n';
    }
    else {
        var results = JSON.parse(data);
        message += "닉네임: " + user_name + "\n";
        for (let i = 0; i < results.length; i++) {
            var character = results[i];
            message += character['ServerName'] + '/' + character['CharacterName'] + '/' + character['CharacterClassName'] + '/' + character['ItemAvgLevel'] + '\n';
        }
        message += "총 " + results.length + "캐릭";
    }
    return message;
}

function msg_foundation(user_name) {
    var url = "https://developer-lostark.game.onstove.com/armories/characters/" + user_name + "/collectibles";
    var data = getData(url);
    var message = "[내실 정보]\n";
    if (data == 'null') {
        message += 'null\n';
    }
    else {
        var results = JSON.parse(data);
        message += "닉네임: " + user_name + "\n";
        for (let i = 0; i < results.length; i++) {
            var elem = results[i];
            message += elem['Type'] + ': ' + elem['Point'] + '/' + elem['MaxPoint'];
            if (i < results.length - 1) {
                message += '\n';
            }
        }
    }
    return message;
}

function msg_equip(user_name) {
    var url = "https://developer-lostark.game.onstove.com/armories/characters/" + user_name + "/equipment";
    var data = getData(url);
    var message = "[캐릭터 장비]\n";
    if (data == 'null') {
        message += 'null\n';
    }
    else {
        var results = JSON.parse(data);
        message += "닉네임: " + user_name + "\n";
        var sum = 0;        for(let i=0; i<6; i++) {
            var tooltip = JSON.parse(results[i]['Tooltip']);
            var quality_value = tooltip['Element_001']['value']['qualityValue'];
            sum += Number(quality_value);
            var level = results[i]['Name'];
            message += level + ' ' + quality_value + '\n';
        }
        message += "장비 품질 평균: " + (sum/6).toFixed(2);
    }
    return message;
}

function msg_gem(user_name) {
    var url = "https://developer-lostark.game.onstove.com/armories/characters/" + user_name + "/gems";
    var data = getData(url);
    var message = "[캐릭터 보석]\n";
    if (data == 'null') {
        message += 'null\n';
    }
    else {
        var results = JSON.parse(data);
        var gems = results['Gems'];
        var effects = results['Effects'];
        message += "닉네임: " + user_name + "\n";
        var sum = 0;
        for (let i = 0; i < gems.length; i++) {
            var tooltip = JSON.parse(gems[i]['Tooltip']);
            sum += Number(gems[i]['Level']);
            message += gems[i]['Name'].substring(1).trimEnd() + ": " + effects[i]['Name'] + "\n";
        }
        message += "보석 레벨 평균: " + (sum/gems.length).toFixed(2);
    }
    return message;
}

function msg_profile(user_name) {
    var url = "https://developer-lostark.game.onstove.com/armories/characters/" + user_name + "/profiles";
    var data = getData(url);
    var message = "[캐릭터 프로필]\n";
    if (data == 'null') {
        message += 'null\n';
    }
    else {
        var results = JSON.parse(data);
        if (results['ServerName'] == "") {
            results['ServerName'] = 'null';
        }
        message += "닉/서버/클래스: " + user_name + '/' + results['ServerName'] + '/' + results['CharacterClassName'] + "\n";
        message += "칭호: " + results['Title'] + "\n"
        message += "길드: " + results['GuildName'] + "\n"
        message += "영지: " + results['TownName'] + "\n"
        message += "템/전/원: " + results['ItemAvgLevel'] + '/' + results['CharacterLevel'] + '/' + results['ExpeditionLevel'] + "\n";
        if (results['Stats'] != null) {
            message += "치/특/신: " + results['Stats'][0]['Value'] + '/' + results['Stats'][1]['Value'] + '/' + results['Stats'][2]['Value'] + "\n";
        }
        message += "지/담/매: " + results['Tendencies'][0]['Point'] + '/' + results['Tendencies'][1]['Point'] + '/' + results['Tendencies'][2]['Point'] + "\n";
        message += msg_card(cmd[1]);
        message += msg_engraving(cmd[1]);
    }
    return message;
}

function character_image(user_name) {
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
            message += drawImage(user_name, results['CharacterImage'], CHARACTER_TYPE);
        }
    }
    return message;
}

function msg_card(user_name) {
    var url = "https://developer-lostark.game.onstove.com/armories/characters/" + user_name + "/cards";
    var data = getData(url);
    var message = "카드: ";
    if (data == 'null') {
        message += 'null\n';
    }
    else {
        var results = JSON.parse(data);
        var last_cardset_index = results['Effects'].length - 1; 
        var last_effect_index = results['Effects'][last_cardset_index]['Items'].length - 1;
        message += results['Effects'][last_cardset_index]['Items'][last_effect_index]['Name'] + "\n";
    }
    return message;
}

function msg_engraving(user_name) {
    var url = "https://developer-lostark.game.onstove.com/armories/characters/" + user_name + "/engravings";
    var data = getData(url);
    var message = "각인: "
    if (data == 'null') {
        message += 'null';
    }
    else {
        var results = JSON.parse(data);
        for (i = 0; i < results['Effects'].length; i++) {
            var lvidx = results['Effects'][i]['Name'].split(" ").length-1
            var first = results['Effects'][i]['Name'].split(" ")[0][0];
            var last = results['Effects'][i]['Name'].split(" ")[lvidx];
            message += first + last;
            if (i == results['Effects'].length-1) break;
            message += "/";
        }
    }
    return message;
}

function msg_getChatGPTResponse(msg) {
    let json;
    let result;

    let data = {
        "model": "gpt-3.5-turbo",
        "messages": [{
            "role": "system",
            "content": "당신은 모든 분야의 전문가입니다. 친근하고 짧게 150자 이내로 답변해주세요."
        },{"role":"user","content":msg}],
        "temperature":0, 
        "max_tokens":192,
        "top_p":1, 
        "frequency_penalty": 0.0, 
        "presence_penalty":0.0
    }
 
    try {
        let response = org.jsoup.Jsoup.connect("https://api.openai.com/v1/chat/completions")
        .header("Content-Type", "application/json")
        .header("Authorization","Bearer " + GPT_API_KEY).requestBody(JSON.stringify(data))
        .ignoreContentType(true).ignoreHttpErrors(true).timeout(200000).post()
        let result1 = JSON.parse(response.text());
        result = result1.choices[0].message.content; 
    } catch(error){
        result = error + "\n" + error.stack;
        Log.e(error.stack);
    }
    return result;
}

function msg_getChatGPTFunctionCalling(msg) {
    let message = "";
    let data = {
        "model": "gpt-3.5-turbo-0613",
        "messages": [{
            "role": "system",
            "content": "null"
        },{"role":"user","content":msg}],
        "functions": [{
            "name": "naverSearchLocal",
            "description": "특정 지역에 존재하는 맛집, 음식점, 병원, 마트, 여행지, 영화관, 산책로, 드라이브 코스, 데이트 코스, 주말에 놀러 갈만한 곳 등 다양한 장소에 대한 정보를 얻어야합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "지역이나 위치이름 eg. 서울, 부산, 제주도, 화성 근처, 수원 근교, 경기도 화성시, 대구 달서구, 동작구, 압구정, 홍대입구역 근처, 문래역, 병점역",
                    },
                    "place": {
                        "type": "string",
                        "description": "장소 eg. 나들이 코스, 맛집, 알탕집, 냉면집, 고기집, 스시집, 음식점, 병원, 산책로, 드라이브 코스, 데이트 코스, 마트, 관광지, 구경, 놀곳",
                    },
                    "unit": {
                        "type": "string"
                    },
                },
                "required": ["location", "place"],
            },
        },],
        "function_call": "auto",
        "temperature":0, 
        "max_tokens":192,
        "top_p":1, 
        "frequency_penalty": 0.0, 
        "presence_penalty":0.0
    }
 
    try {
        let response = org.jsoup.Jsoup.connect("https://api.openai.com/v1/chat/completions")
        .header("Content-Type", "application/json")
        .header("Authorization","Bearer " + GPT_API_KEY).requestBody(JSON.stringify(data))
        .ignoreContentType(true).ignoreHttpErrors(true).timeout(200000).post()
        let jsonData = JSON.parse(response.text()); // return JSON.stringify(jsonData);
        let functionToCall = jsonData.choices[0].message['function_call'];
        if (functionToCall) {
            let searchingResult = JSON.stringify(functionToCall["arguments"]);
            let functionName = functionToCall["name"];
            if (functionName == 'naverSearchLocal') {
                let location = JSON.parse(functionToCall.arguments).location;
                let place = JSON.parse(functionToCall.arguments).place;
                //let debug = JSON.stringify(jsonData.choices[0].message);  // for debug
                //message += debug + '\n';                                  // for debug
                //message += "searching result: " + searchingResult + "\n"; // for debug
                searchingResult += functionList[functionName](location + " " + place + "\n"); // Naver에서 지역 + 장소 검색
                let prompt = "사용자의 질문: \"" + msg + ".\"";
                prompt += "다음 검색결과에 기반하여 사용자의 질문에 답변해주고, 답변의 마지막에는 naver map 지도 링크를 알려주세요.\n"
                prompt += "검색결과: \"" + searchingResult + "\"";
                message += msg_getChatGPTFunctionCallingResponse(prompt);
            }
        }
        else {
            message += "no function to call.\n";
            message += msg_getChatGPTResponse(msg);
        }
    } catch(error){
        result = error + "\n" + error.stack;
        Log.e(error.stack);
    }
    return message;
}

function msg_getChatGPTFunctionCallingResponse(msg) {
    let json;
    let result;

    let data = {
        "model": "gpt-3.5-turbo",
        "messages": [{
            "role": "system",
            "content": "당신은 모든 분야의 전문가입니다. 친근하고 짧게 150자 이내로 답변해주세요."
        },{"role":"user","content":msg}],
        "temperature":0, 
        "max_tokens":192,
        "top_p":1, 
        "frequency_penalty": 0.0, 
        "presence_penalty":0.0
    }
 
    try {
        let response = org.jsoup.Jsoup.connect("https://api.openai.com/v1/chat/completions")
        .header("Content-Type", "application/json")
        .header("Authorization","Bearer " + GPT_API_KEY).requestBody(JSON.stringify(data))
        .ignoreContentType(true).ignoreHttpErrors(true).timeout(200000).post()
        let result1 = JSON.parse(response.text());
        result = result1.choices[0].message.content; 
    } catch(error){
        result = error + "\n" + error.stack;
        Log.e(error.stack);
    }
    return result;
}

function getSalary(level) {
    var sum = 0;
    var kamen = false;
    var abrel = false;
    var sangatap = false;
    var iliakhan = false;
    var kayangel = false;
    var kuku = false;
    var viakis = false;
    var valtan = false;
    var gold_count = 3;
    
    if (level >= 1630 && gold_count) { // 카멘 하드 1-4
        sum += 41000;
        kamen = true;
        gold_count--;
    }
    if (level >= 1620 && gold_count) { // 상아탑 하드 1-4
        sum += 14500;
        sangatap = true;
        gold_count--;
    }
    if (level >= 1610 && gold_count && !kamen) { // 카멘 노말 1-3
        sum += 13000;
        kamen = true;
        gold_count--;
    }
    if (level >= 1600 && gold_count) { // 일리아칸 하드 1-4
        sum += 10000;
        iliakhan = true;
        gold_count--;
    }
    if (level >= 1600 && gold_count && !sangatap) { // 상아탑 노말 1-3
        sum += 9000;
        sangatap = true;
        gold_count--;
    }
    if (level >= 1580 && gold_count) { // 카양겔 하드 1-3
        sum += 6500;
        kayangel = true;
        gold_count--;
    }
    if (level >= 1580 && gold_count && !iliakhan) { // 일리아칸 노말 1-3
        sum += 6500;
        iliakhan = true;
        gold_count--;
    }
    if (level >= 1560 && gold_count) { // 아브렐슈드 하드 1-4
        sum += 9000;
        abrel = true;
        gold_count--;
    }
    if (level >= 1550 && gold_count && !abrel) { // 아브렐슈드 하드 1-3 노말 4
        sum += 8500;
        abrel = true;
        gold_count--;
    }
    if (level >= 1540 && gold_count && !kayangel) { // 카양겔 노말 1-3
        sum += 4500;
        kayangel = true;
        gold_count--;
    }
    if (level >= 1520 && gold_count && !abrel) { // 아브렐슈드 노말 1-4
        sum += 7000;
        abrel = true;
        gold_count--;
    }
    if (level >= 1500 && gold_count && !abrel) { // 아브렐슈드 노말 1-3
        sum += 7000;
        abrel = true;
        gold_count--;
    }
    if (level >= 1475 && gold_count) { // 쿠크 노말 1-3
        sum += 3000;
        kuku = true;
        gold_count--;
    }
    if (level >= 1460 && gold_count) { // 비아 하드 1-2
        sum += 2400;
        viakis = true;
        gold_count--;
    }
    if (level >= 1445 && gold_count) { // 발탄 하드 1-2
        sum += 1800;
        valtan = true;
        gold_count--;
    }
    if (level >= 1430 && gold_count && !viakis) { // 비아 노말 1-2
        sum += 1600;
        viakis = true;
        gold_count--;
    }
    if (level >= 1415 && gold_count && !valtan) { // 발탄 노말 1-2
        sum += 1200;
        valtan = true;
        gold_count--;
    }
    return sum;
}

function msg_help() {
    var message = "";
    message += "[현재 구현된 기능]\n";
    message += "!정보 [아이디]\n";
    message += "!장비 [아이디]\n";
    message += "!보석 [아이디]\n";
    message += "!부캐 [아이디]\n";
    message += "!주급 [아이디]\n";
    message += "!내실 [아이디]\n";
    message += "!주사위\n";
    message += "!전카팩\n";
    message += "!심연\n";
    message += "!결속\n";
    message += "!이벤트\n";
    message += "!보석시세\n";
    message += "!강화재료\n";
    message += "!운세 [X띠]\n";
    message += "!날씨 [지역]\n";
    message += "!밀도야 [내용]\n";
    message += "!도움말";
    return message;
}

function msg_weather(msg) {
    Link =("https://www.google.com/search?q=날씨 ");
    var message = "";
    let Area = msg;
    let Weader = org.jsoup.Jsoup.connect(Link+Area).get();
    let C = Weader.select ("#wob_tm").text();
    let F = Weader.select ("#wob_ttm").text();
    let Pre = Weader.select ("#wob_pp").text(); //강수
    let Humidity = Weader.select ("#wob_hm").text(); //습도
    let Wind = Weader.select ("#wob_tws").text(); //풍속
    let Time = Weader.select ("#wob_dts").text(); //측정시간
    let Summary = Weader.select ("#wob_dc").text(); //요약
    message += "[ " + Area + "의 날씨입니다. ]\n\n" + Summary + "\n\n섭씨 : " + C + "°C" + "\n화씨 : " + F + "°F\n" + "강수량 : " + Pre + "\n습도 : " + Humidity + "\n풍속 : " + Wind + "\n\n" + Time;
    return message;
}

function msg_destiny(animall) {
    var message = "";
    var line = '-'.repeat(32);
    var url = org.jsoup.Jsoup.connect("https://search.naver.com/search.naver?where=nexearch&sm=tab_etc&qvt=0&query=" + animall + "운세").get();
    var result = url.select("#yearFortune > div > div.detail > p:nth-child(3)").text();
    if(result == "") {
        replier.reply('"띠"를 붙여 다시 검색해주세요.\n또는 검색어 결과가 없습니다.');
        return;
    }
    message += ("🌟오늘의 " + animall + " 운세🌟\n" + line + "\n" + result);
    return message;
}

function msg_dice() {
    var message = "";
    var ment = ["주사위를 데구르르 굴렸더니~ ", "굴려~ 굴려~ ", "주사위 눈금은...? ", "어떤 숫자가 나왔을까! "];
    var ment_index = Math.floor(Math.random() * ment.length);
    message += ment[ment_index] + '[' + (Math.floor(Math.random() * 6) + 1).toString() + ']';
    return message;
}

function msg_legendCard1() {
    var message = "";
    var cards = ['카단', '니나브', '바훈투르', '샨디', '실리안', '아제나&이난나', '웨이', '일리아칸', '아만', '데런 아만', '카마인', '국왕 실리안', '진저웨일', '베아트리스', '에스더 갈라투르', '가디언 루', '에스더 루테란', '광기를 잃은 쿠크세이튼', '에스더 시엔'];
    message += '[' + cards[Math.floor(Math.random() * cards.length)] + '] 카드 당첨~!';
    return message;
}

function msg_legendCard2() {
    var message = "";
    var cards = ['카단', '니나브', '바훈투르', '샨디', '실리안', '아제나&이난나', '웨이', '카멘', '발탄', '비아키스', '아브렐슈드', '일리아칸', '쿠크세이튼', '진저웨일', '베아트리스', '에스더 갈라투르', '에스더 루테란', '광기를 잃은 쿠크세이튼', '에스더 시엔'];
    message += '[' + cards[Math.floor(Math.random() * cards.length)] + '] 카드 당첨~!';
    return message;
}

function msg_legendCard3() {
    var message = "";
    var cards = ['카멘', '발탄', '비아키스', '아브렐슈드', '일리아칸', '쿠크세이튼', '아만', '데런 아만', '카마인', '국왕 실리안', '진저웨일', '베아트리스', '에스더 갈라투르', '바르칸', '가디언 루', '에버그레이스', '에스더 루테란', '광기를 잃은 쿠크세이튼', '에스더 시엔'];
    message += '[' + cards[Math.floor(Math.random() * cards.length)] + '] 카드 당첨~!';
    return message;
}

function event_image() {
    var url = "https://developer-lostark.game.onstove.com/news/events"
    var data = getData(url);
    var message = "";
    if (data == 'null') {
        message += 'null\n';
    }
    else {
        var results = JSON.parse(data);
        message += drawImage("", results[0]['Thumbnail'], EVENT_TYPE);
    }
    return message;
}

function msg_event() {
    var url = "https://developer-lostark.game.onstove.com/news/events"
    var data = getData(url);
    var message = "[이벤트 정보]\n";
    if (data == 'null') {
        message += 'null\n';
    }
    else {
        var results = JSON.parse(data);
        for (let i = 0; i < results.length; i++) {
            elem = results[i];
            message += "🌟" + elem['Title'] + '🌟\n';
            message += elem['Link'] + '\n';
            message += "기간: " + elem['StartDate'].split('T')[0] + " ~ " + elem['EndDate'].split('T')[0];
            if (i < results.length - 1) {
                message += '\n\n';
            }
        }
    }
    return message;
}

function msg_enhanceIngredient() {
    var message = "[재련재료 거래소 현시세]\n";
    var line = '-'.repeat(32);
    var itemList = ['정제된 파괴강석', '정제된 수호강석', '최상급 오레하 융화 재료', '상급 오레하 융화 재료', '찬란한 명예의 돌파석', '경이로운 명예의 돌파석'];
    var itemName;
    var categoryCode = 50010;
    for (var i = 0; i < itemList.length; i++) {
        itemName = itemList[i];
        price = getMarketPrice(categoryCode, itemName);
        message += itemName + ': ' + price + 'G\n';
    }
    message += line + "\n[보조재료 거래소 현시세]\n";
    itemList = ['태양의 가호', '태양의 축복', '태양의 은총'];
    categoryCode = 50020;
    for (var i = 0; i < itemList.length; i++) {
        itemName = itemList[i];
        price = getMarketPrice(categoryCode, itemName);
        message += itemName + ': ' + price + 'G';
        if (i < itemList.length - 1) {
            message += '\n';
        }
    }
    return message;
}

function getMarketPrice(CategoryCode, ItemName) {
    var url = "https://developer-lostark.game.onstove.com/markets/items"
    var response = org.jsoup.Jsoup.connect(url)
    .header("Content-Type", "application/json")
    .header("authorization", 'bearer ' + API_KEY)
    .requestBody(JSON.stringify({
        "Sort": "GRADE",
        "CategoryCode": CategoryCode,
        "CharacterClass": null,
        "ItemTier": null,
        "ItemGrade": null,
        "ItemName": ItemName,
        "PageNo": 0,
        "SortCondition": "ASC"
    }))
    .ignoreContentType(true)
    .ignoreHttpErrors(true)
    .post();
    var result = JSON.parse(response.text());
    ret = result['Items'][0]['CurrentMinPrice'];
    return ret;
}

function getGemPrice(gem_name) {
    var url = "https://developer-lostark.game.onstove.com/auctions/items"
    var response = org.jsoup.Jsoup.connect(url)
    .header("Content-Type", "application/json")
    .header("authorization", 'bearer ' + API_KEY)
    .requestBody(JSON.stringify({
            "ItemLevelMin": 0,
            "ItemLevelMax": 0,
            "ItemGradeQuality": null,
            "SkillOptions": [
              {
                "FirstOption": null,
                "SecondOption": null,
                "MinValue": null,
                "MaxValue": null
              }
            ],
            "EtcOptions": [
              {
                "FirstOption": null,
                "SecondOption": null,
                "MinValue": null,
                "MaxValue": null
              }
            ],
            "Sort": "BUY_PRICE",
            "CategoryCode": 210000,
            "CharacterClass": null,
            "ItemTier": "3",
            "ItemGrade": null,
            "ItemName": gem_name,
            "PageNo": 0,
            "SortCondition": "ASC"
    }))
    .ignoreContentType(true)
    .ignoreHttpErrors(true)
    .post();
    var result = JSON.parse(response.text());
    ret = result['Items'][0]['AuctionInfo']['BuyPrice'];
    return ret;
}

function msg_gemPrice() {
    var message = "[경매장 최저가 보석 시세]\n";
    gemList = ["10레벨 멸화의 보석", "10레벨 홍염의 보석", "9레벨 멸화의 보석", "9레벨 홍염의 보석"];
    for (let i = 0; i < gemList.length; i++) {
        message += gemList[i] + ": " + getGemPrice(gemList[i]) + "G";
        if (i < gemList.length - 1) {
            message += '\n';
        }
    }
    return message;
}

function msg_nullCmd(user_name) {
    var message = "뭔소리여";
    return message;
}

function getData(url) {
    var data = org.jsoup.Jsoup.connect(url)
    .header("accept", "application/json")
    .header("authorization", 'bearer ' + API_KEY)
    .ignoreContentType(true)
    .ignoreHttpErrors(true)
    .get().text();
    return data;
}

function drawImage(user_name, url, imageType) {
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