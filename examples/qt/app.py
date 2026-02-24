from PySide6.QtWidgets import *
from PySide6.QtCore import *
from PySide6.QtGui import *
from PySide6.QtWebChannel import QWebChannel
from PySide6.QtWebEngineWidgets import QWebEngineView
from PySide6.QtWebEngineCore import QWebEngineSettings

import os
from dynamsoft_barcode_reader_bundle import *
import base64
import http.server
import socketserver
import threading

class HttpDaemon(threading.Thread):
    def __init__(self, port):
        threading.Thread.__init__(self)
        self.port = port
        self.daemon = True

    def run(self):
        Handler = http.server.SimpleHTTPRequestHandler
        # Change directory to the script's directory to serve files correctly
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        with socketserver.TCPServer(("", self.port), Handler) as httpd:
            httpd.serve_forever()

# Start HTTP server
http_daemon = HttpDaemon(8000)
http_daemon.start()

# Initialize Dynamsoft Barcode Reader
# Apply for a trial license: https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
errorCode, errorMsg = LicenseManager.init_license(
    'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==')
if errorCode != EnumErrorCode.EC_OK and errorCode != EnumErrorCode.EC_LICENSE_WARNING:
    print('License initialization failed: ErrorCode:', errorCode, ', ErrorString:', errorMsg)
cvr_instance = CaptureVisionRouter()

# Create Qt application
app = QApplication([])
win = QWidget()
win.setWindowTitle('Dynamic Web TWAIN and Dynamsoft Barcode Reader')

# Create a layout
layout = QVBoxLayout()
win.setLayout(layout)


class Backend(QObject):
    @Slot(str)
    def onDataReady(self, base64img):
        imgdata = base64.b64decode(base64img)

        try:
            result = cvr_instance.capture(bytes(imgdata), EnumPresetTemplate.PT_READ_BARCODES)
            if result.get_error_code() not in [EnumErrorCode.EC_OK, EnumErrorCode.EC_LICENSE_WARNING]:
                print('Capture error:', result.get_error_string())
                return
            barcode_result = result.get_decoded_barcodes_result()
            if barcode_result is None:
                text_area.setText('No barcode found.')
                return
            items = barcode_result.get_items()
            out = ''
            for item in items:
                out += 'Barcode Format : '
                out += item.get_format_string() + '\n'
                out += 'Barcode Text : '
                out += item.get_text() + '\n'
                out += '-------------------------------------------------' + '\n'
            text_area.setText(out)
        except Exception as e:
            print(e)

    @Slot(str)
    def log(self, message):
        print("[JS Log]:", message)
        text_area.append("[JS Log]: " + message)


class WebView(QWebEngineView):
    def __init__(self):
        QWebEngineView.__init__(self)

        self.settings().setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessFileUrls, True)
        self.settings().setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True)
        self.settings().setAttribute(QWebEngineSettings.WebAttribute.LocalStorageEnabled, True)

        # Load web page and resource files to QWebEngineView
        self.load(QUrl("http://127.0.0.1:8000/index.html"))
        self.backend = Backend(self)
        self.channel = QWebChannel(self.page())
        self.channel.registerObject('backend', self.backend)
        self.page().setWebChannel(self.channel)


# Initialize widgets
view = WebView()
bt_scan = QPushButton('Scan Document')
bt_load = QPushButton('Load Document')
bt_read = QPushButton('Read Barcode')
text_area = QTextEdit()

# Acquire an image


def acquire_image():
    frame = view.page()
    frame.runJavaScript('acquireImage();')

# Refresh web view


def refresh_page():
    view.reload()

# Get base64 image data for barcode reading


def read_barcode():
    frame = view.page()
    frame.runJavaScript('getCurrentImage();')


def load_image():
    frame = view.page()
    frame.runJavaScript('loadImage();')


bt_scan.clicked.connect(acquire_image)
bt_read.clicked.connect(read_barcode)
bt_load.clicked.connect(load_image)

layout.addWidget(view)
layout.addWidget(bt_scan)
layout.addWidget(bt_load)
layout.addWidget(bt_read)
layout.addWidget(text_area)

# Key events


def keyPressEvent(event):
    if event.key() == Qt.Key.Key_Q:
        win.close()
    elif event.key() == Qt.Key.Key_R:
        refresh_page()


win.keyPressEvent = keyPressEvent

win.show()
app.exec()
