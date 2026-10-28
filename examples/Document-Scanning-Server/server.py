#coding=utf-8
from flask import Flask, request, render_template, send_file
from selenium import webdriver
import threading

browser = None
DWT_created = False

app = Flask(__name__, static_url_path='/', static_folder='static')

def start_chrome():
    chromedriver = 'chromedriver102.exe'
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('headless')
    global browser
    browser = webdriver.Chrome(executable_path=chromedriver, options=chrome_options)

def create_DWT():
    browser.get('http://127.0.0.1:5000/DWT.html')
    global DWT_created
    DWT_created = browser.execute_async_script('''
                                            const cb = arguments[arguments.length - 1];
                                            CreateDWT(cb);
                                            ''')
@app.route('/api/scan')
def scan():
    resolution = request.args.get('resolution', '300')
    selected_index = request.args.get('selectedIndex', '0')
    pixelType = request.args.get('pixelType', '0')
    js = '''
        const cb = arguments[arguments.length - 1];
        var options = {};
        options.showUI = false;
        options.resolution = '''+resolution+''';
        options.selectedIndex = '''+selected_index+''';
        options.pixelType = '''+pixelType+''';
        Scan(options,cb);
        '''
    print(js)
    result = browser.execute_async_script(js);
    print(result)
    if result != False:
        return {"success":True, "base64":result}
    else:
        return {"success":False}

@app.route('/api/dwtpage/load')
def load():
    if DWT_created == False:
        print("dwt loading")
        create_DWT()
        if DWT_created == True:
            return {"loaded":True}
        else:
            return {"loaded":False}
    else:
        return {"loaded":True}


@app.route('/api/scanner/getlist')
def get_scanner_list():
    scanners = browser.execute_script('''
                                        scanners = GetScannersList();
                                        return scanners;
                                        ''')
    return {"scanners":scanners}

if __name__ == '__main__':
    threading.Thread(target=start_chrome, args=()).start()
    app.run(host='0.0.0.0')

 