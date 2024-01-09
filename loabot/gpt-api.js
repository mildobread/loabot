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
    }
};

function _msg_gptSummary(msg, token, sender) {
    let response;
    let data = {
        "model": "gpt-3.5-turbo",
        "messages": [{
            "role": "system",
            "content": "This is a conversation from a KakaoTalk chat room. The left side shows the person speaking, and the right side shows the message they sent. Please summarize the important parts of this conversation in less than 300 characters. to korean"
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

function _msg_getChatGPTResponse(msg) {
    let json;
    let result;

    let data = {
        "model": "gpt-3.5-turbo",
        "messages": [{
            "role": "system",
            "content": "너는 게으름뱅이야. 반드시 반말로 건방지고 짧게 150자 이내로 답변해줘."
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

function _msg_getChatGPTFunctionCalling(msg, replier) {
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
        },
        {
            "name": "naverSearchNews",
            "description": "특정 주제에 대한 뉴스 기사 정보를 얻어야합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "subject": {
                        "type": "string",
                        "description": "특정인 혹은 특정 주제 eg. 경제, 세계, 영화, 생활, 문화, 기술, IT, 연예, 스포츠, 정치, 사회 등",
                    },
                    "article": {
                        "type": "string",
                        "description": "최근 뉴스, 기사 등에 실린 최신 이슈나 근황이 어떻게 되고 있는지, 얼마나 진행중인지 eg. 특정인 혹은 특정 주제에 사회 이슈, 관련된 최근 사건, 동향, 결과, 개봉, 발표, 연구, 소식, 상황, 요새, 어제",
                    },
                    "unit": {
                        "type": "string"
                    },
                },
                "required": ["subject", "article"],
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
                // let debug = JSON.stringify(jsonData.choices[0].message);  // for debug
                // message += debug + '\n';                                  // for debug
                // message += "searching result: " + searchingResult + "\n"; // for debug
                searchingResult += functionList[functionName](location + " " + place + "\n"); // kakao map에서 지역 + 장소 검색
                if (searchingResult == null) {
                    message += _msg_getChatGPTResponse(msg);
                    return message;
                }
                let prompt = "사용자의 질문: \"" + msg + ".\"";
                prompt += "다음 검색결과에 기반하여 사용자의 질문에 반드시 귀찮은 티를 내며 반말로 답변해주고, 답변의 마지막에는 링크를 알려줘.\n"
                prompt += "검색결과: \"" + searchingResult + "\"";
                message += _msg_getChatGPTFunctionCallingResponse(prompt);
            }
            else if (functionName == 'naverSearchNews') {
                let subject = JSON.parse(functionToCall.arguments).subject;
                let article = JSON.parse(functionToCall.arguments).article;
                // let debug = JSON.stringify(jsonData.choices[0].message);  // for debug
                // message += debug + '\n';                                  // for debug
                // message += "searching result: " + searchingResult + "\n"; // for debug
                searchingResult += functionList[functionName](subject + " " + article + "\n"); // 네이버 뉴스에서 검색
                if (searchingResult == null) {
                    message += _msg_getChatGPTResponse(msg);
                    return message;
                }
                let prompt = "사용자의 질문: \"" + msg + ".\"";
                prompt += "다음 검색결과에 기반하여 사용자의 질문에 반드시 귀찮은 티를 내며 반말로 답변해줘.\n"
                prompt += "검색결과: \"" + searchingResult + "\"";
                message += _msg_getChatGPTFunctionCallingResponse(prompt);
            }
        }
        else {
            //message += "no function to call.\n";
            message += _msg_getChatGPTResponse(msg);
        }
    } catch(error){
        result = error + "\n" + error.stack;
        Log.e(error.stack);
    }
    return message;
}

function _msg_getChatGPTFunctionCallingResponse(msg) {
    let json;
    let result;

    let data = {
        "model": "gpt-3.5-turbo",
        "messages": [{
            "role": "system",
            "content": "너는 게으름뱅이야. 반드시 반말로 건방지고 짧게 150자 이내로 답변해줘."
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