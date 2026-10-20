from flask import Flask, request, render_template, send_file
from werkzeug.utils import secure_filename
import email_utils
import dropbox_helper
import os
app = Flask(__name__, static_url_path='/', static_folder='static')

@app.route('/')
def index():
   return render_template('index.html')

@app.route('/files', methods=['POST','GET'])
def handle_files():
    if request.method == 'POST':
        f = request.files['RemoteFile']
        path = './uploaded/'
        if os.path.exists(path)==False:
            os.makedirs(path)
        f.save(os.path.join(path,secure_filename(f.filename)))
        response={"status": "success", "filename": f.filename}
        return response
    elif request.method == 'GET':
        filename = request.args.get('filename', '')
        path = os.path.join('./uploaded/',filename)
        if os.path.exists(path):
            return send_file(path,as_attachment=True, attachment_filename=filename)


@app.route('/emails', methods=['POST'])
def emails():
    if request.method == 'POST':
        f = request.files['RemoteFile']
        send_to = request.form['sendto']
        filebytes=f.read()
        result=False
        if len(filebytes)>10*1024*1024:
            dbx = dropbox_helper.dropbox_helper()
            path = '/{}'.format(f.filename)
            if dbx.upload(filebytes,path):
                link = dbx.create_sharing_link(path)
                if link!=None:
                    result = email_utils.send_with_link(send_to,link)
        else:
            result = email_utils.send_with_attatchment(send_to,filebytes,f.filename)
        if result==True:
            result="success"
        else:
            result="failed"
        response={"status": result}
        return response


if __name__ == '__main__':
   app.run()