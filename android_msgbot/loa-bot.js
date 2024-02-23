importPackage(android.graphics);
importPackage(Packages.okhttp3);

const keys = require('api-keys.js');
const play = require('loa-msg-play.js');
const loaApi = require('loa-msg-from-api.js');
const utils = require('loa-utils.js');
const gptApi = require('gpt-api.js');
const ytApi = require('script-from-yt-api.js');

const LOA_API_KEY = keys.LOA_API_KEY;
const GPT_API_KEY = keys.GPT_API_KEY;
const NAVER_CID = keys.NAVER_CID;
const NAVER_CSC = keys.NAVER_CSC;
const KAKAO_API_KEY = keys.KAKAO_API_KEY;
const GGL_API_KEY = keys.GGL_API_KEY;
const GGL_SID = keys.GGL_SID

const CHARACTER_TYPE = 0;
const EVENT_TYPE = 1;

const DRAW_MENT = ["(슥슥...)", "(발톱에 물감 묻히는중...)", "(좀만 기다려봐...)", "(물감 챙기는중...)", "(엉...기다려봐...)"];
const YT_MENT = ["(크흠...)", "(머리 과부하 걸리는중...)", "(머리가 지끈지끈...)", "(좀 걸릴거야...)", "(엉...기다려봐...)"];
const EXTERNAL = 1;
const WELCOME = "🙌🏻 어서오세요 반갑습니다 🙌🏻";

var msgLists = [];
var style = "lazy";

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

function responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName, isMultiChat) {
    // Unsaved messages
    if (adminMildo(room, msg, sender, replier)) return;
    if (youtube_summarization(msg, replier)) return;
    if (gpt_response(msg, replier)) return;

    // Welcome message
    if (msg.startsWith(WELCOME)) {
        message = "반갑습니다! 아래 설명에 따라 밀도봇을 이용해보세요.\n\n"
        message += msg_help();
        replier.reply(message);
        return;
    }

    // Saved messages
    addElementToRoom(room, msg, sender);
    if (msg == "!요약") {
        replier.reply("요약중...");
        var content = gptApi.msg_gptSummary(msgLists[room].join("\n"));
        replier.reply(" 대화내용 요약" + "\u200b".repeat(500) + "\n\n" + content);
        return;
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
                message = play.msg_dice();
                break;
            case "!전카팩":
                message = play.msg_legendCard1();
                break;
            case "!심연":
                message = play.msg_legendCard2();
                break;
            case "!결속":
                message = play.msg_legendCard3();
                break;
            case "!보석시세":
                message = loaApi.msg_gemPrice();
                break;
            case "!강화재료":
                message = loaApi.msg_enhanceIngredient();
                break;
            case "!이벤트":
                cimg = utils.event_image();
                if (cimg != null) {
                    replier.reply(cimg)
                }
                message = loaApi.msg_event();
                break;
            case "!서버":
                message = ytApi.msg_serverAlive();
                break;
            default:
                message = msg_nullCmd();
                break;
        }
    }
    // Type: "/Commnad ID"
    else if (cmd.length >= 2) {
        switch (cmd[0]) {
            case "!장비":
                message = loaApi.msg_equip(cmd[1], EXTERNAL);
                break;
            case "!정보":
                cimg = utils.character_image(cmd[1]);
                if (cimg != null) {
                    replier.reply(cimg)
                }
                message = loaApi.msg_profile(cmd[1]);
                break;
            case "!보석":
                message = loaApi.msg_gem(cmd[1]);
                break;
            case "!부캐":
                message = loaApi.msg_expedition(cmd[1]);
                break;
            case "!내실":
                message = loaApi.msg_foundation(cmd[1]);
                break;
            case "!주급":
                message = loaApi.msg_salary(cmd[1]);
                break;
            case "!날씨":
                message = play.msg_weather(cmd[1])
                break;
            case "!운세":
                message = play.msg_destiny(cmd[1])
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
    message += "!요약\n";
    message += "!운세 [X띠]\n";
    message += "!날씨 [지역]\n";
    message += "!유튜브 [링크]\n";
    message += "!밀도야 [내용]\n";
    message += "!밀도야 [내용] 그려줘\n";
    message += "!도움말";
    return message;
}

function addElementToRoom(room, msg, sender) {
    element = sender + ": " + msg;
    if (!msgLists.hasOwnProperty(room)) {
        msgLists[room] = [];
    }
    if (msgLists[room].length >= 100) {
        msgLists[room].shift();
    }
    msgLists[room].push(element);
}

function msg_nullCmd(user_name) {
    var message = "뭔개소리여";
    if (Math.random() < 0.5) {
        message += ".. 어떻게 쓰는지 모르겠으면 '!도움말' 명령을 참고해봐."
    }
    return message;
}

function adminMildo(room, msg, sender, replier) {
    // GPT - admin
    if (msg.startsWith("/") && (sender == "Mine" || sender == "낙지볶음" || sender == "니나브/밀도식빵/블레이드")) {
        var personality = msg.substr(1);
        var message = "";
        if (personality == "lazy") {
            style = personality;
            message += "매운맛 밀도 세팅 완료.";
        }
        else if (personality == "kind") {
            style = personality;
            message += "순한맛 밀도 세팅 완료.";
        }
        else if (personality == "cute") {
            style = personality;
            message += "귀여운 밀도 세팅 완료.";
        }
        else if (personality == "stupid") {
            style = personality;
            message += "멍청한 밀도 세팅 완료.";
        }
        else {
            message += "세팅할 수 없는 성격입니다.";
        }
        replier.reply(message);
        return true;
    }
    else {
        return false;
    }
}

function youtube_summarization(msg, replier) {
    if (msg.startsWith("!유튜브 ")) {
        var message = "";
        var subStr = msg.substr(5);
        replier.reply(YT_MENT[gptApi.getRandomInt(DRAW_MENT.length - 1)]);
        message += ytApi.msg_script(subStr);
        replier.reply(message);
        return true;
    }
    else {
        return false;
    }
}

function gpt_response(msg, replier) {
    if (msg.startsWith("!밀도야 ")) {
        var message = "";
        var drawRequest = "그려줘";
        var subStr = msg.substr(5);
        var prompt = subStr;
        if (subStr.includes(drawRequest)) {
            replier.reply(DRAW_MENT[gptApi.getRandomInt(DRAW_MENT.length - 1)]);
            var karloPrompt = subStr.split(drawRequest)[0].trim();
            message += utils.msg_draw(karloPrompt);
        }
        else {
            message += gptApi.msg_getChatGPTFunctionCalling(prompt, replier, style)
        }
        replier.reply(message);
        return true;
    }
    else {
        return false;
    }
}