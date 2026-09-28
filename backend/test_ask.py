import requests
import sys

url = 'http://127.0.0.1:8000/ask'
payload = {
    'question': 'What text appears on the page?',
    'doc_id': 'd38a9983-089c-4bf5-9b91-abfb72f3bc33',
    'mode': 'study'
}

try:
    resp = requests.post(url, json=payload, timeout=15)
    print('STATUS', resp.status_code)
    print(resp.text)
except Exception as e:
    print('ERROR', e)
    sys.exit(1)
