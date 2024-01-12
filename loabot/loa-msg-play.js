function _msg_weather(msg) {
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

function _msg_destiny(animall) {
    var message = "";
    if (!animall in ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지']) {
        message += '그런 띠는 없단다..'
        return message;
    }
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

function _msg_dice() {
    var message = "";
    var ment = ["주사위를 데구르르 굴렸더니~ ", "굴려~ 굴려~ ", "주사위 눈금은...? ", "어떤 숫자가 나왔을까! "];
    var ment_index = Math.floor(Math.random() * ment.length);
    message += ment[ment_index] + '[' + (Math.floor(Math.random() * 6) + 1).toString() + ']';
    return message;
}

function _msg_legendCard1() {
    var message = "";
    var cards = ['카단', '니나브', '바훈투르', '샨디', '실리안', '아제나&이난나', '웨이', '일리아칸', '아만', '데런 아만', '카마인', '국왕 실리안', '진저웨일', '베아트리스', '에스더 갈라투르', '가디언 루', '에스더 루테란', '광기를 잃은 쿠크세이튼', '에스더 시엔'];
    message += '[' + cards[Math.floor(Math.random() * cards.length)] + '] 카드 당첨~!';
    return message;
}

function _msg_legendCard2() {
    var message = "";
    var cards = ['카단', '니나브', '바훈투르', '샨디', '실리안', '아제나&이난나', '웨이', '카멘', '발탄', '비아키스', '아브렐슈드', '일리아칸', '쿠크세이튼', '진저웨일', '베아트리스', '에스더 갈라투르', '에스더 루테란', '광기를 잃은 쿠크세이튼', '에스더 시엔'];
    message += '[' + cards[Math.floor(Math.random() * cards.length)] + '] 카드 당첨~!';
    return message;
}

function _msg_legendCard3() {
    var message = "";
    var cards = ['카멘', '발탄', '비아키스', '아브렐슈드', '일리아칸', '쿠크세이튼', '아만', '데런 아만', '카마인', '국왕 실리안', '진저웨일', '베아트리스', '에스더 갈라투르', '바르칸', '가디언 루', '에버그레이스', '에스더 루테란', '광기를 잃은 쿠크세이튼', '에스더 시엔'];
    message += '[' + cards[Math.floor(Math.random() * cards.length)] + '] 카드 당첨~!';
    return message;
}

module.exports = {
    msg_weather: _msg_weather,
    msg_destiny: _msg_destiny,
    msg_dice: _msg_dice,
    msg_legendCard1: _msg_legendCard1,
    msg_legendCard2: _msg_legendCard2,
    msg_legendCard3: _msg_legendCard3
}