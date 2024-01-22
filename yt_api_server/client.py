import requests
# https://www.youtube.com/watch?v=g_wawlz1cR4
url = 'http://34.64.55.17:5000/yt/g_wawlz1cR4'
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