PERSONALITY_SUMMARY = "This is a conversation from a KakaoTalk chat room. The left side shows the person speaking, and the right side shows the message they sent. Please summarize the important parts of this conversation in less than 300 characters. to korean.";
PERSONALITY_RESPONSE = {
    "lazy": "너는 게으름뱅이야. 사용자의 다음 질문에 대해 반드시 반말로 건방지게 300자 이내로 답변해줘.",
    "kind": "당신은 모든 분야의 전문가입니다. 사용자의 다음 질문에 대해 친근하게 300자 이내로 답변해주세요.",
    "cute": "너는 귀여운 아기시바견이야. 사용자의 다음 질문에 대해 발랄하고 사랑스럽게 300자 이내로 답변해주고 말끝에는 멍멍을 붙여.",
    "stupid": "너는 아는게 하나도 없는 멍청이야. 사용자의 다음 질문에 대해 불확실한 말투로 잘 모르겠다고 말해."
};

const MENT = ["(짱구 굴리는중...)", "(뇌세포 총동원중...)", "(발톱으로 타자치는중...)", "(끙...)", "(침흘리는중...)"];
const ANGRY = ["멍청한놈", "한심한놈", "으휴..", "에휴.. 말을 말자", "쯧쯧.."];

let functionList = {
    kakaoSearchLocal: function(query) {
        let response = org.jsoup.Jsoup.connect("https://dapi.kakao.com/v2/local/search/keyword.json?query=" + query + "&size=5")
            .header("Authorization", "KakaoAK " + KAKAO_API_KEY)
            .ignoreContentType(true)
            .ignoreHttpErrors(true)
            .get().text();
        response = JSON.parse(response);
        let searchListLength = response["documents"].length;
        let index = Math.floor(Math.random() * (searchListLength));
        let place = response["documents"][index];
        let message = "";
        //let message = "index: " + index + ", searchListLength: " + searchListLength + "\n";
        if (place == null) {
            return null;
        }
        message += "장소: " + place["place_name"] + "\n";
        message += "카테고리: " + place["category_group_name"] + "\n";
        message += "세부분류: " + place["category_name"] + "\n";
        message += "주소: " + place["address_name"] + "\n";
        message += "전화번호: " + place["phone"] + "\n";
        message += "링크: " + place["place_url"];
        return message;
    },
    naverSearchNews: function(query) {
        let apiUrl = "https://openapi.naver.com/v1/search/news?query=" + query + "&display=5&sort=sim";
        let okhttpClient = new OkHttpClient();
        let request = new Request.Builder()
            .url(apiUrl)
            .header("X-Naver-Client-Id", NAVER_CID)
            .header("X-Naver-Client-Secret", NAVER_CSC)
            .build();
        let responseStr = okhttpClient.newCall(request).execute().body().string();
        response = JSON.parse(responseStr);
        let searchListLength = response["items"].length;
        let index = Math.floor(Math.random() * (searchListLength));
        let message = "";
        message += response["items"][index]["title"].replace(/&quot;/g, '"').replace(/<b>|<\/b>/g, '') + '\n';
        message += response["items"][index]["description"].replace(/&quot;/g, '"').replace(/<b>|<\/b>/g, '') + '\n';
        message += response["items"][index]["link"];
        return message;
    },
    naverSearchShopping: function(query) {
        let apiUrl = "https://openapi.naver.com/v1/search/shop?query=" + query + "&display=5&sort=sim";
        let okhttpClient = new OkHttpClient();
        let request = new Request.Builder()
            .url(apiUrl)
            .header("X-Naver-Client-Id", NAVER_CID)
            .header("X-Naver-Client-Secret", NAVER_CSC)
            .build();
        let responseStr = okhttpClient.newCall(request).execute().body().string();
        response = JSON.parse(responseStr);
        let searchListLength = response["items"].length;
        let index = Math.floor(Math.random() * (searchListLength));
        let message = "";
        message += response["items"][index]["title"].replace(/&quot;/g, '"').replace(/<b>|<\/b>/g, '') + '\n';
        message += response["items"][index]["link"];
        return message;
    },
    now: function() {
        let message = "";
        var currentDateTime = new Date();
        var currentDate = currentDateTime.toLocaleDateString();
        var currentTime = currentDateTime.toLocaleTimeString();
        var dayOfWeekIndex = currentDateTime.getDay();
        var daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        var dayOfWeekString = daysOfWeek[dayOfWeekIndex];
        message += "현재 날짜: " + currentDate + "\n";
        message += "현재 시간: " + currentTime + "\n";
        message += "현재 요일: " + dayOfWeekString + "\n";
        return message;
    },
    route: function() {
        let message = "";
        return message;
    }
};

function _getRandomInt(n) {
    return Math.floor(Math.random() * (n + 1));
}

function str_includes(mainString, substrings) {
    for (substring of substrings) {
        if (mainString.includes(substring)) {
            return true
        } else {
            return false
        }
    }
}

function _msg_gptSummary(msg, token, sender) {
    let response;
    let data = {
        "model": "gpt-3.5-turbo",
        "messages": [{
            "role": "system",
            "content": PERSONALITY_SUMMARY
        },{"role": "user", "content": msg}],
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
        return message.content;
    } catch (error) {
        result = "오류!\n" + error + "\n" + JSON.stringify(response, null, 2);
        Log.e(error.stack);
        return result;
    }
}

function _msg_getChatGPTResponse(msg, style) {
    let json;
    let result;

    let data = {
        "model": "gpt-3.5-turbo",
        "messages": [{
            "role": "system",
            "content": PERSONALITY_RESPONSE[style]
        },{"role":"user","content":msg}],
        "temperature":0, 
        "max_tokens":300,
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

function _msg_getChatGPTFunctionCalling(msg, replier, style) {
    let message = "";
    let data = {
        "model": "gpt-3.5-turbo-0613",
        "messages": [{
            "role": "system",
            "content": "null"
        },{"role":"user","content":msg}],
        "functions": [{
            "name": "kakaoSearchLocal",
            "description": "장소에 가는 방법이 아니라 반드시 장소를 추천해달라는 요청에만 응답해야합니다. 절대 장소가 아닌것에 대한 추천 요청에 응답하면 안됩니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "지역, 도시, 특정 위치의 이름 eg. 서울, 의왕, 부산, 제주도, 화성 근처, 수원 근교, 강남, 신촌, 연남동, 동작구, 압구정, 홍대입구역 근처, 병점역",
                    },
                    "place": {
                        "type": "string",
                        "description": "지명이 아니라 업체, 상호명, 관광지 이름 eg. 나들이 코스, 음식점, 고기집, 병원, 산책로, 데이트 코스, 관광지, 구경, 놀곳, 점집",
                    },
                    "unit": {
                        "type": "string"
                    },
                },
                "required": ["location", "place"],
            },
        },{
            "name": "naverSearchNews",
            "description": "반드시 특정 주제에 대한 최신 소식에 대해 알려달라는 요청에만 응답해야합니다. 질문에 대한 뉴스 기사 정보를 얻어야합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "subject": {
                        "type": "string",
                        "description": "특정인 혹은 특정 주제 eg. 경제, 영화, 기술, 연예, 스포츠, 정치, 부동산 등",
                    },
                    "article": {
                        "type": "string",
                        "description": "뉴스, 기사, 피습 사건, 경기 결과, 재판 결과, 영화 개봉, 깜짝 발표, 신제품 출시, 지점 오픈, 연구 결과, 열애 소식, 엄중한 상황",
                    },
                    "unit": {
                        "type": "string"
                    },
                },
                "required": ["subject", "article"],
            },
        },{
            "name": "naverSearchShopping",
            "description": "반드시 상품을 추천해달라는 요청에만 응답해야합니다. 구매처와 가격 정보 및 최저가를 찾아야합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product": {
                        "type": "string",
                        "description": "특정 상품 및 물건 eg. 삼성 냉장고, 컴퓨터, 여성 후드티, 그래픽카드, 버버리 지갑, 나이키 바지, 뉴발란스 신발, 프라다 가방",
                    },
                    "price": {
                        "type": "string",
                        "description": "특정 상품의 가격에 대한 정보 eg. 최고가, 추천, 최저가, 가격, 얼마, 사려면, 구매, 싸게, 어떤게 좋아?",
                    },
                    "unit": {
                        "type": "string"
                    },
                },
                "required": ["product", "price"],
            },
        },{
            "name": "now",
            "description": "현재 시간 및 날짜에 대해 묻는 질문에 대답해야합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "description": "현재 시간 및 날짜에 대한 정보 eg. 요일, 며칠, 지금, 오늘, 어제, 내일",
                    },
                    "unit": {
                        "type": "string"
                    },
                },
                "required": ["date"],
            },
        },{
            "name": "route",
            "description": "출발지부터 목적지까지 가는 방법에대한 요청에만 응답해야합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "source": {
                        "type": "string",
                        "description": "출발지 eg. 서울, 동대구역, 양재역, 김포공항",
                    },
                    "destination": {
                        "type": "string",
                        "description": "목적지 eg. 대구, 합정역, 방배동, 홍대입구",
                    },
                    "unit": {
                        "type": "string"
                    },
                },
                "required": ["source", "destination"],
            },
        }],
        "function_call": "auto",
        "temperature":0, 
        "max_tokens":300,
        "top_p":1, 
        "frequency_penalty": 0.8, 
        "presence_penalty":0.0
    }
 
    try {
        let response = org.jsoup.Jsoup.connect("https://api.openai.com/v1/chat/completions")
            .header("Content-Type", "application/json")
            .header("Authorization","Bearer " + GPT_API_KEY).requestBody(JSON.stringify(data))
            .ignoreContentType(true).ignoreHttpErrors(true).timeout(200000).post()
        let jsonData = JSON.parse(response.text()); // return JSON.stringify(jsonData);
        let functionToCall = jsonData.choices[0].message['function_call'];
        let prompt = "\n사용자의 질문: \"" + msg + ".\" ";
        if (functionToCall) {
            let searchingResult = "";
            //let searchingResult = JSON.stringify(functionToCall["arguments"]);
            let functionName = functionToCall["name"];
            replier.reply(MENT[_getRandomInt(MENT.length - 1)]);
            switch (functionName) {
                case 'kakaoSearchLocal':
                    let location = JSON.parse(functionToCall.arguments).location;
                    let place = JSON.parse(functionToCall.arguments).place;
                    searchingResult += functionList[functionName](location + " " + place + "\n"); // kakao map에서 지역 + 장소 검색
                    if (searchingResult == 'null') {
                        message += _msg_getChatGPTResponse(msg, style);
                        return message;
                    }
                    prompt += PERSONALITY_RESPONSE[style] + "검색결과에 https://로 시작하는 링크 정보가 있다면 답변의 마지막에는 반드시 링크를 알려줘.\n";
                    prompt += "검색결과: \"" + searchingResult + "\"";
                    message += _msg_getChatGPTFunctionCallingResponse(prompt, style);
                    break;

                case 'naverSearchNews':
                    let subject = JSON.parse(functionToCall.arguments).subject;
                    let article = JSON.parse(functionToCall.arguments).article;
                    searchingResult += functionList[functionName](subject + " " + article + "\n"); // 네이버 뉴스에서 검색
                    if (searchingResult == 'null') {
                        message += _msg_getChatGPTResponse(msg, style);
                        return message;
                    }
                    prompt += PERSONALITY_RESPONSE[style] + "\n";
                    prompt += "검색결과: \"" + searchingResult + "\"";
                    message += _msg_getChatGPTFunctionCallingResponse(prompt, style);
                    break;

                case 'naverSearchShopping':
                    let product = JSON.parse(functionToCall.arguments).product;
                    let price = JSON.parse(functionToCall.arguments).price;
                    searchingResult += functionList[functionName](product + "\n"); // 네이버 쇼핑에서 검색
                    if (searchingResult == 'null') {
                        message += _msg_getChatGPTResponse(msg, style);
                        return message;
                    }
                    prompt += PERSONALITY_RESPONSE[style] + "검색결과에 https://로 시작하는 링크 정보가 있다면 답변의 마지막에는 반드시 링크를 알려줘.\n";
                    prompt += "검색결과: \"" + searchingResult + "\"";
                    message += _msg_getChatGPTFunctionCallingResponse(prompt, style);
                    break;

                case 'now':
                    let date = JSON.parse(functionToCall.arguments).date;
                    searchingResult += functionList[functionName](); // 현재 날짜
                    prompt += PERSONALITY_RESPONSE[style];
                    prompt += "검색결과: \"" + searchingResult + "\"";
                    message += _msg_getChatGPTFunctionCallingResponse(prompt, style);
                    if (style == 'lazy') {
                        message += " " + ANGRY[_getRandomInt(ANGRY.length - 1)];
                    }
                    break;

                case 'route':
                    // naver map api is needed
                    message += _msg_getChatGPTResponse(msg, style);
                    break;

                default:
                    message += "짱구 굴리다 뚝배기터지겠다!\n";
                    message += _msg_getChatGPTResponse(msg, style);
                    break;
            }
        }
        else {
            //message += "no function to call.\n";
            replier.reply("음..");
            message += _msg_getChatGPTResponse(msg, style);
        }
    } catch(error){
        result = error + "\n" + error.stack;
        Log.e(error.stack);
    }
    return message;
}

function _msg_getChatGPTFunctionCallingResponse(msg, style) {
    let json;
    let result;

    let data = {
        "model": "gpt-3.5-turbo",
        "messages": [{
            "role": "system",
            "content": PERSONALITY_RESPONSE[style]
        },{"role":"user","content":msg}],
        "temperature":0, 
        "max_tokens":300,
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

module.exports = {
    msg_gptSummary: _msg_gptSummary,
    msg_getChatGPTResponse: _msg_getChatGPTResponse,
    msg_getChatGPTFunctionCalling: _msg_getChatGPTFunctionCalling,
    msg_getChatGPTFunctionCallingResponse: _msg_getChatGPTFunctionCallingResponse,
    getRandomInt: _getRandomInt,
}