import requests

url = 'https://yt-script-ccbnl.run.goorm.site/yt/mPf5nhhadQw'
api_key = 'mildobread'

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json',
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    print('요청이 성공했습니다.')
    print('응답 내용:', response.text)
else:
    print(f'요청이 실패했습니다. 상태 코드: {response.status_code}')