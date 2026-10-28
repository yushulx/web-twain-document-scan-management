from flask import Flask,request,redirect,Response
import requests
app = Flask(__name__, static_url_path='/app', static_folder='./')
SITE_NAME = "http://127.0.0.1:18622/"

@app.route("/<path:path>",methods=["GET","POST"])
def proxy(path):
    global SITE_NAME
    request_headers = {key: value for (key, value) in request.headers if key.lower() != 'host'}
    excluded_headers = ["content-encoding", "content-length", "transfer-encoding", "connection"]
    if request.method=="GET":
        resp = requests.get(f"{SITE_NAME}{path}", headers=request_headers)
        headers = [(name, value) for (name, value) in  resp.raw.headers.items() if name.lower() not in excluded_headers]
        response = Response(resp.content, resp.status_code, headers)
        return response
    elif request.method=="POST":
        print(request.json)
        resp = requests.post(f"{SITE_NAME}{path}",json=request.json, headers=request_headers)
        headers = [(name, value) for (name, value) in  resp.raw.headers.items() if name.lower() not in excluded_headers]
        response = Response(resp.content, resp.status_code, headers)
        return response



if __name__ == "__main__":
    app.run(host="0.0.0.0",debug = True,port=8089)
