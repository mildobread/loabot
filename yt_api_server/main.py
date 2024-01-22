from fastapi import FastAPI, HTTPException, Depends, status
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
from fastapi.security import APIKeyHeader
import requests
import json


app = FastAPI()


API_KEY = "mildobread"
GPT_API_KEY = "mildobread"
api_key_header = APIKeyHeader(name="Authorization")
YOUTUBESCRIPT_SUMMARY = """
당신은 요약 전문가입니다. 다음 유튜브 동영상 스크립트를 보고,
 사용자에게 영상에 담긴 내용을 목차별로 자세히 요약해주세요.
"""


@app.get("/yt/{vid}")
def get_script(vid: str, api_key: str = Depends(api_key_header)):
    if api_key != f"Bearer {API_KEY}":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    try:
        transcript = YouTubeTranscriptApi.get_transcript(vid, languages=['ko'])
        text_formatter = TextFormatter()
        text_formatted = text_formatter.format_transcript(transcript)
        text_info = text_formatted.replace("\n", " ")
        result = msg_gptSummaryScript(text_info)
        return {"script": result}
    except Exception as e:
        print(f"An error occurred: {e}")
        return {"script": "null"}


@app.get("/")
async def read_root(api_key: str = Depends(api_key_header)):
    if api_key != f"Bearer {API_KEY}":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    message = "API Server is alive."
    print(message)
    return {"script": message}


def msg_gptSummaryScript(msg):
    url = 'https://api.openai.com/v1/chat/completions'
    data = {
        "model": "gpt-3.5-turbo-16k",
        "messages": [{
            "role": "system",
            "content": YOUTUBESCRIPT_SUMMARY
        }, {"role": "user", "content": msg}],
        "max_tokens": 2048
    }
    headers = {
        'Authorization': f'Bearer {GPT_API_KEY}',
        'Content-Type': 'application/json',
    }
    try:
        response = requests.post(url, data=json.dumps(data), headers=headers)
        response_data = response.json()
        if response.status_code == 200:
            print('요청이 성공했습니다.')
            print('응답 내용:', response_data)
            message = response_data['choices'][0]['message']['content']
        else:
            message = f'요청이 실패했습니다. 상태 코드: {response.status_code}'
            print(message)
        return message
    except Exception as e:
        result = f"오류!\n{str(e)}\n{json.dumps(response, indent=2)}"
        return result
