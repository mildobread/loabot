const salary = require('loa-salary.js');

const INTERNAL = 0;

function _msg_salary(user_name) {
    var url = "https://developer-lostark.game.onstove.com/characters/" + user_name + "/siblings";
    var data = getData(url);
    var message = "";
    if (data == 'null') {
        message += 'null\n';
    }
    else {
        message += "[" + user_name + " 주급]\n";
        var results = JSON.parse(data);
        var server;
        var sum = 0;
        for (let i = 0; i < results.length; i++) { // find server
            var character = results[i];
            if (character['CharacterName'] == user_name) {
                server = character['ServerName'];
                break;
            }
        }
        message += '▶ ' + server + '\n';
        for (let i = 0; i < results.length; i++) {
            var character = results[i];
            if (server != character['ServerName']) {
                continue;
            }
            var level = character['ItemAvgLevel'].split(",")[0] + character['ItemAvgLevel'].split(",")[1];
            var week_salary = salary.getSalary(Number(level));
            sum += week_salary;
            message += character['CharacterName'] + ": " + week_salary.toString() + "G\n";
        }
        message += "♣ 합계: " + sum + "G";
    }
    return message;
}

function _msg_expedition(user_name) {
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

function _msg_foundation(user_name) {
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

function _msg_equip(user_name, type) {
    var url = "https://developer-lostark.game.onstove.com/armories/characters/" + user_name + "/equipment";
    var data = getData(url);
    var message = "[캐릭터 장비 정보]\n";
    if (data == 'null') {
        message += 'null\n';
        return message;
    }
    else {
        var results = JSON.parse(data);
        var isSpecialEffect = false;

        var sumElixir = 0;
        var sumQuality = 0;
        var sumOverwlm = 0;

        message += '닉네임: ' + user_name + '\n\n';
        for (let i = 0; i < 6; i++) {
            if (!results[i]['Name'].startsWith('+')) {
                message += '장비를 제대로 안끼고있음';
                return message;
            }
            var equip_name = results[i]['Name'];

            var tooltip = JSON.parse(results[i]['Tooltip']);
            var quality_value = tooltip['Element_001']['value']['qualityValue'];
            var effect = 'Element_';

            var elixirString = '';
            var overwlString = '';
            var highenString = '';

            for (let j = 5; j <= 10; j++) {
                var key = effect + String(j).padStart(3, '0');
                var stringify = JSON.stringify(tooltip[key])
                if (stringify == undefined) break;
                if (stringify.includes("엘릭서 효과")) {
                    var elixir = tooltip[key]['value']['Element_000']['contentStr'];
                    var pattern = /Lv\.(\d+)/g;
                    for (let k = 0; k < 2; k++) {
                        var option_key = effect + String(k).padStart(3, '0');
                        if (elixir && elixir[option_key]) {
                            var elixir_op = elixir[option_key]['contentStr'];
                            var match = pattern.exec(elixir_op);
                            var elixir_op_lvl = match[1];
                            sumElixir += Number(elixir_op_lvl);
                            elixirString += '\n ▶ [엘릭서] - ' + elixir_op.split(match[0])[0] + match[0];
                            pattern.lastIndex = 0;
                            isSpecialEffect = true;
                        }
                    }
                }
                else if (stringify.includes('초월')) {
                    var overLvlStr = String(tooltip[key]['value']['Element_000']['topStr']).split('[초월]')[1].split('단계')[0];
                    overwlString += ' ♣ [초월] -' + overLvlStr + '단계';
                    sumOverwlm += Number(overLvlStr);
                    isSpecialEffect = true;
                }
                else if (stringify.includes('상급 재련')) {
                    highenString += ' ◈ [상급 재련] - ' + tooltip[key]['value'].split('[상급 재련]')[1];
                    isSpecialEffect = true;
                }
            }
            sumQuality += Number(quality_value);

            message += equip_name + ' [' + quality_value + ']';
            if (elixirString) message += elixirString + '\n';
            if (overwlString) message += overwlString + '\n';
            if (highenString) message += highenString + '\n';
            message += '\n';
        }
        var retmsg = '';
        retmsg += '엘릭서 합계: ' + sumElixir + '\n';
        retmsg += '초월 합계: ' + sumOverwlm;

        if (!isSpecialEffect) message += '\n';
        message += '장비 품질 평균: ' + (sumQuality/6).toFixed(2) + '\n';
        message += retmsg;

        if (type == INTERNAL) return retmsg;
    }
    return message;
}

function _msg_gem(user_name) {
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

function _msg_profile(user_name) {
    var url = "https://developer-lostark.game.onstove.com/armories/characters/" + user_name + "/profiles";
    var data = getData(url);
    var message = "[캐릭터 프로필]\n";
    if (data == 'null') {
        message += 'null\n';
        return message;
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
        message += _msg_card(cmd[1]);
        message += _msg_engraving(cmd[1]);
        message += _msg_equip(cmd[1], INTERNAL);
    }
    return message;
}

function _msg_card(user_name) {
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

function _msg_engraving(user_name) {
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
    return message + '\n';
}

function _msg_event() {
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

function _msg_gemPrice() {
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

function _msg_enhanceIngredient() {
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
    .header("authorization", 'bearer ' + LOA_API_KEY)
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
    .header("authorization", 'bearer ' + LOA_API_KEY)
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
    msg_salary: _msg_salary,
    msg_expedition: _msg_expedition,
    msg_foundation: _msg_foundation,
    msg_equip: _msg_equip,
    msg_gem: _msg_gem,
    msg_profile: _msg_profile,
    msg_card: _msg_card,
    msg_engraving: _msg_engraving,
    msg_event: _msg_event,
    msg_gemPrice: _msg_gemPrice,
    msg_enhanceIngredient: _msg_enhanceIngredient
}