const salary = require('loa-salary.js');

function _msg_salary(user_name) {
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
            sum += salary.getSalary(Number(level));
            var character_salary = salary.getSalary(Number(level)).toString();
            message += character['CharacterName'] + ": " + character_salary + "G\n";
        }
        message += "합계: " + sum.toString() + "G"
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

function _msg_equip(user_name) {
    var url = "https://developer-lostark.game.onstove.com/armories/characters/" + user_name + "/equipment";
    var data = getData(url);
    var message = "[캐릭터 장비]\n";
    if (data == 'null') {
        message += 'null\n';
    }
    else {
        var results = JSON.parse(data);
        message += "닉네임: " + user_name + "\n";
        var sum = 0;
        for (let i=0; i<6; i++) {
            var tooltip = JSON.parse(results[i]['Tooltip']);
            var quality_value = tooltip['Element_001']['value']['qualityValue'];
            sum += Number(quality_value);
            var level = results[i]['Name'];
            message += level + ' ' + quality_value + '\n';
        }
        message += "장비 품질 평균: " + (sum/6).toFixed(2) + '\n';
    }
    message += msg_elixir(user_name)
    return message;
}

function msg_elixir(user_name) {
    var url = "https://developer-lostark.game.onstove.com/armories/characters/" + user_name + "/equipment";
    var data = getData(url);
    var message = "\n[캐릭터 엘릭서 정보]\n";
    if (data == 'null') {
        message += 'null\n';
        return message;
    }
    else {
        var results = JSON.parse(data);
        var sum = 0;
        for (let i=1; i<6; i++) {
            var tooltip = JSON.parse(results[i]['Tooltip']);
            var overStr = "Element_008";
            var element = tooltip[overStr]['value']['Element_000'];
            if (element && typeof element == 'object' && 'topStr' in element) { // 엘릭서 or 초월이 존재
                var isOver = String(tooltip[overStr]['value']['Element_000']['topStr']).includes('초월'); // 08번에 초월 존재
                if (isOver) { // 초월 O
                    overStr = "Element_009"; // 엘릭서는 09번으로
                    isOver = String(tooltip[overStr]['value']['Element_000']['topStr']).includes('엘릭서');
                }
                var elixir = tooltip[overStr]['value']['Element_000']['contentStr'];
                var pattern = /Lv\.(\d+)/g;
                var equip_name = results[i]['Name'];
                message += equip_name + '\n';

                if (elixir && elixir["Element_000"]) {
                    var elixir_op1 = elixir["Element_000"]["contentStr"];
                    var match1 = pattern.exec(elixir_op1);
                    var elixir_op1_lvl = match1[1];
                    sum += Number(elixir_op1_lvl);
                    message += ' ▶ ' + elixir_op1.split(match1[0])[0] + match1[0] + '\n';
                    pattern.lastIndex = 0;
                }
                if (elixir && elixir["Element_001"]) {
                    var elixir_op2 = elixir["Element_001"]["contentStr"];
                    var match2 = pattern.exec(elixir_op2);
                    var elixir_op2_lvl = match2[1];
                    sum += Number(elixir_op2_lvl);
                    message += ' ▶ ' + elixir_op2.split(match2[0])[0] + match2[0] + '\n';
                }
            }
            else {
                var equip_name = results[i]['Name'];
                message += equip_name + '\n';
            }
        }
        message += "엘릭서 합계: " + sum;
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
    return message;
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