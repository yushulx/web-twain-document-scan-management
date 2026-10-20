from flask import Flask, request, send_file
from flask_cors import CORS, cross_origin
from PIL import Image
import base64
from io import BytesIO
import base64
import os
import time
import json
app = Flask(__name__, static_url_path='/', static_folder='./')
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/UploadFile', methods=['POST','GET'])
@cross_origin()
def upload_file():
    if request.method == 'POST':
        f = request.files['RemoteFile']
        path = './uploaded/'
        if os.path.exists(path)==False:
            os.makedirs(path)
        filename = str(int(time.time()*1000))+'.jpg'
        f.save(os.path.join(path,filename))
        response={"status": "success", "filename": filename}
        return json.dumps(response)
    else:
        return ""

#for base64
@app.route('/Upload', methods=['POST'])
@cross_origin()
def upload():
    if request.method == 'POST':
        data = request.get_json()
        if 'base64' in data:
            path = './uploaded/'
            if os.path.exists(path)==False:
                os.makedirs(path)
            bytes_decoded = base64.b64decode(data['base64'])
            img = Image.open(BytesIO(bytes_decoded))
            # to jpg
            out_jpg = img.convert('RGB')
            filename = str(int(time.time()*1000))+'.jpg'
            # save file
            out_jpg.save(os.path.join(path,filename))
            response={'status': 'success', 'filename': filename}
            return json.dumps(response)
        
@app.route('/Get', methods=['GET'])
def get():
    filename = request.args.get('filename', '')
    path = os.path.join('./uploaded/',filename)
    if os.path.exists(path):
        return send_file(path,as_attachment=True, attachment_filename=filename)


if __name__ == '__main__':
   app.run(host = "0.0.0.0", port = 8888, ssl_context='adhoc')