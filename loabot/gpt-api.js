PERSONALITY_SUMMARY = "This is a conversation from a KakaoTalk chat room. The left side shows the person speaking, and the right side shows the message they sent. Please summarize the important parts of this conversation in less than 300 characters. to korean.";
PERSONALITY_RESPONSE = {
    "lazy": "너는 게으름뱅이야. 반드시 반말로 건방지고 짧게 150자 이내로 답변해줘.",
    "kind": "당신은 모든 분야의 전문가입니다. 친근하고 짧게 150자 이내로 답변해주세요.",
    "cute": "너는 귀여운 아기시바견이야. 발랄하고 사랑스럽고 귀엽게 150자 이내로 답변해주고 말끝에는 멍멍을 붙여.",
    "stupid": "너는 아는게 하나도 없는 멍청한 사람이야. 반드시 불확실한 말투로 답변하고, 답변 도중에 잘 모르겠다고 말해. 모르는게 죄는 아니니까 네가 사과할 필요는 없어."
};
PERSONALITY_RESPONSE_FC = {
    "lazy": "너는 게으름뱅이야. 다음 검색결과에 기반하여 사용자의 질문에 반드시 귀찮은 티를 내며 반말로 답변해줘.",
    "kind": "당신은 모든 분야의 전문가입니다. 다음 검색결과에 기반하여 친근하고 짧게 150자 이내로 답변해주세요.",
    "cute": "너는 귀여운 아기시바견이야. 다음 검색결과에 기반하여 발랄하고 사랑스럽고 귀엽게 150자 이내로 답변해주고 말끝에는 멍멍을 붙여.",
    "stupid": "너는 아는게 하나도 없는 멍청한 사람이야. 반드시 불확실한 말투로 답변하고, 답변 도중에 잘 모르겠다고 말해. 모르는게 죄는 아니니까 네가 사과할 필요는 없어."
};

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
    googleSearchFlight: function(query, arrivals) {
        let apiUrl = "https://www.googleapis.com/customsearch/v1?key=" + GGL_API_KEY + "&cx=" + GGL_SID + "&q=" + query + "&start=1"
        let okhttpClient = new OkHttpClient();
        let request = new Request.Builder()
         .url(apiUrl)
         .build();
        let responseStr = okhttpClient.newCall(request).execute().body().string();
        response = JSON.parse(responseStr);
        let searchListLength = response["items"].length;
        let trash_links = ["tour", "tistory", "kin", "youtube", "blog", "book", "news", "dcinside", "fmkorea", "ruliweb", "theqoo", "clien", "mlbpark", "instiz", "todayhumor"];
        let message = "";//query + "\n";
        let matched = 0;
        for (let index = 0; index < searchListLength; index++) {
            disp_link = response["items"][index]["displayLink"];
            title = response["items"][index]["title"];
            if (str_includes(disp_link, trash_links) == false && title.includes(arrivals) && matched < 3) {
                message += title.replace(/&quot;/g, '"').replace(/<b>|<\/b>/g, '') + '\n';
                message += response["items"][index]["snippet"].replace(/&quot;/g, '"').replace(/<b>|<\/b>/g, '') + '\n';
                message += "링크: " + response["items"][index]["formattedUrl"] + '\n';
                matched++;
            }
        }
        return message;
    }
};

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
        },{
            "name": "naverSearchNews",
            "description": "특정 주제에 대한 뉴스 기사 정보를 얻어야합니다.",
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
            "description": "특정 물건에 대해 구매처와 가격 정보 최저가/최고가를 찾아야합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product": {
                        "type": "string",
                        "description": "특정 상품 및 물건 eg. 삼성 냉장고, 컴퓨터, 여성 후드티, 그래픽카드, 버버리 지갑, 무신사 맨투맨, 나이키 바지, 뉴발란스 신발, 프라다 가방",
                    },
                    "price": {
                        "type": "string",
                        "description": "특정 상품의 가격에 대한 정보 eg. 최고가, 추천, 최저가, 가격, 얼마, 사려면, 구매, 장만하려는데, 싸게, 어떤게 좋아?, 어디서",
                    },
                    "unit": {
                        "type": "string"
                    },
                },
                "required": ["product", "price"],
            },
        },{
            "name": "googleSearchFlight",
            "description": "비행기 항공편 정보. 특정 날짜에 출발지에서 목적지까지 이동하는 항공권 정보를 찾아야합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "description": "날짜 eg. 2월 13일, 3/12일, 8월19일 등",
                    },
                    "departures": {
                        "type": "string",
                        "description": "출발지 eg. 인천, 인천공항, 김포, 김포공항",
                    },
                    "arrivals": {
                        "type": "string",
                        "description": "목적지 eg. 일본, 미국, 삿포로, 세부 공항, 오사카",
                    },
                    "unit": {
                        "type": "string"
                    },
                },
                "required": ["date", "arrivals"],
            },
        }],
        "function_call": "auto",
        "temperature":0, 
        "max_tokens":256,
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
            replier.reply("(짱구 굴리는중...)");
            let searchingResult = JSON.stringify(functionToCall["arguments"]);
            let functionName = functionToCall["name"];
            if (functionName == 'kakaoSearchLocal') {
                let location = JSON.parse(functionToCall.arguments).location;
                let place = JSON.parse(functionToCall.arguments).place;
                searchingResult += functionList[functionName](location + " " + place + "\n"); // kakao map에서 지역 + 장소 검색
                if (searchingResult == null) {
                    message += _msg_getChatGPTResponse(msg, style);
                    return message;
                }
                let prompt = "사용자의 질문: \"" + msg + ".\"";
                prompt += PERSONALITY_RESPONSE_FC[style] + "답변의 마지막에는 링크를 알려줘.\n";
                prompt += "검색결과: \"" + searchingResult + "\"";
                message += _msg_getChatGPTFunctionCallingResponse(prompt, style);
            }
            else if (functionName == 'naverSearchNews') {
                let subject = JSON.parse(functionToCall.arguments).subject;
                let article = JSON.parse(functionToCall.arguments).article;
                searchingResult += functionList[functionName](subject + " " + article + "\n"); // 네이버 뉴스에서 검색
                if (searchingResult == null) {
                    message += _msg_getChatGPTResponse(msg, style);
                    return message;
                }
                let prompt = "사용자의 질문: \"" + msg + ".\"";
                prompt += PERSONALITY_RESPONSE_FC[style] + "\n";
                prompt += "검색결과: \"" + searchingResult + "\"";
                message += _msg_getChatGPTFunctionCallingResponse(prompt, style);
            }
            else if (functionName == 'naverSearchShopping') {
                let product = JSON.parse(functionToCall.arguments).product;
                let price = JSON.parse(functionToCall.arguments).price;
                searchingResult += functionList[functionName](product + "\n"); // 네이버 쇼핑에서 검색
                if (searchingResult == null) {
                    message += _msg_getChatGPTResponse(msg, style);
                    return message;
                }
                let prompt = "사용자의 질문: \"" + msg + ".\"";
                prompt += PERSONALITY_RESPONSE_FC[style] + "검색결과에 링크 정보가 있다면 답변의 마지막에는 반드시 링크를 알려줘.\n";
                prompt += "검색결과: \"" + searchingResult + "\"";
                message += _msg_getChatGPTFunctionCallingResponse(prompt, style);
            }
            else if (functionName == 'googleSearchFlight') {
                let date = JSON.parse(functionToCall.arguments).date;
                let departures = JSON.parse(functionToCall.arguments).departures;
                let arrivals = JSON.parse(functionToCall.arguments).arrivals;
                if (departures) {
                    searchingResult += functionList[functionName](date + " " + departures + "-" + arrivals + "항공권\n", arrivals); // Web 검색
                }
                else {
                    searchingResult += functionList[functionName](date + " " + " 출발하는 " + arrivals + "행 항공권\n", arrivals); // Web 검색
                }
                if (searchingResult == null) {
                    message += _msg_getChatGPTResponse(msg, style);
                }
                else {
                    let prompt = "사용자의 질문: \"" + msg + ".\"";
                    prompt += PERSONALITY_RESPONSE_FC[style] + "검색결과에 https://로 시작하는 링크 정보가 있다면 답변의 마지막에는 반드시 링크를 알려줘.\n";
                    prompt += "검색결과: \"" + searchingResult + "\"";
                    message += _msg_getChatGPTFunctionCallingResponse(prompt, style);
                }
            }
        }
        else {
            //message += "no function to call.\n";
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

module.exports = {
    msg_gptSummary: _msg_gptSummary,
    msg_getChatGPTResponse: _msg_getChatGPTResponse,
    msg_getChatGPTFunctionCalling: _msg_getChatGPTFunctionCalling,
    msg_getChatGPTFunctionCallingResponse: _msg_getChatGPTFunctionCallingResponse
}