from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib

def send_with_attatchment(to,filebytes,filename):
    msg = build_message(to,filebytes=filebytes,filename=filename)
    return send(msg,to)

def send_with_link(to,link):
    msg = build_message(to,link=link)
    return send(msg,to)

def send(msg,to):
    try:
        account = get_account()
        passwd = get_passwd()
        server = smtplib.SMTP(get_smtp_server(),587)
        server.ehlo()
        server.starttls()
        server.login(account,passwd)
        server.sendmail(account, to, msg.as_string())
        server.quit()
        print("Successfully sent email")
        return True
    except smtplib.SMTPException:
        print("Failed")
        return False

def build_message(to,link=None,filebytes=None,filename=None):
    msg = MIMEMultipart()
    msg['to'] = to
    msg['from'] = get_account()
    msg['subject'] = 'Your scanned documents'
    if filebytes != None:
        att1 = MIMEText(filebytes, 'base64', 'utf8')
        att1["Content-Type"] = 'application/octet-stream'
        att1["Content-Disposition"] = 'attachment; filename="{}"'.format(filename);
        msg.attach(att1)
        body="Hi there,\n\nYour scanned documents are attached."
        msg.attach(MIMEText(body,'plain'))
    if link!=None:
        body="Hi there,\n\nYour scanned documents are large. We've uploaded to dropbox: {}".format(link)
        msg.attach(MIMEText(body,'plain'))
    return msg
    
def get_account():
    with open('account') as f:
        content = f.readlines()
        return content[0].strip()
        
def get_passwd():
    with open('account') as f:
        content = f.readlines()
        return content[1].strip()
        
def get_smtp_server():
    with open('account') as f:
        content = f.readlines()
        return content[2].strip()        


if __name__ == '__main__':
   send("tony@dynamsoft.com",open('test.jpg', 'rb').read(),"test.jpg")