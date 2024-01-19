from fastapi import FastAPI, HTTPException, Depends, status
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
from fastapi.security import APIKeyHeader


app = FastAPI()


API_KEY = "mildobread"
api_key_header = APIKeyHeader(name="Authorization")


@app.get("/yt/{vid}")
def get_script(vid: str, api_key: str = Depends(api_key_header)):
    if api_key != f"Bearer {API_KEY}":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    transcript = YouTubeTranscriptApi.get_transcript(vid, languages=['ko'])
    text_formatter = TextFormatter()
    text_formatted = text_formatter.format_transcript(transcript)
    text_info = text_formatted.replace("\n", " ")
    return {"script": text_info}


@app.get("/")
async def read_root(api_key: str = Depends(api_key_header)):
    if api_key != f"Bearer {API_KEY}":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return {"hello": "world"}
