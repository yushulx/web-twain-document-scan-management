from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from PyQt5.QtGui import *
from PyQt5.QtWebChannel import QWebChannel
from PyQt5.QtWebEngineWidgets import QWebEngineView, QWebEngineSettings

import os
from dbr import *
import base64

# Initialize Dynamsoft Barcode Reader
reader = BarcodeReader()
# Apply for a trial license https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
reader.init_license(
    'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==')

# Create Qt application
app = QApplication([])
win = QWidget()
win.setWindowTitle('Dynamic Web TWAIN and Dynamsoft Barcode Reader')

# Create a layout
layout = QVBoxLayout()
win.setLayout(layout)


class Backend(QObject):
    @pyqtSlot(str)
    def onDataReady(self, base64img):
        imgdata = base64.b64decode(base64img)

        try:
            text_results = reader.decode_file_stream(bytearray(imgdata), '')
            if text_results != None:
                out = ''
                for text_result in text_results:
                    out += "Barcode Format : "
                    out += text_result.barcode_format_string + '\n'
                    out += "Barcode Text : "
                    out += text_result.barcode_text + '\n'
                    out += "-------------------------------------------------" + '\n'

                text_area.setText(out)
        except BarcodeReaderError as bre:
            print(bre)


class WebView(QWebEngineView):
    def __init__(self):
        QWebEngineView.__init__(self)

        self.settings().setAttribute(QWebEngineSettings.LocalContentCanAccessFileUrls, True)
        self.settings().setAttribute(QWebEngineSettings.LocalContentCanAccessRemoteUrls, True)
        self.settings().setAttribute(QWebEngineSettings.WebAttribute.LocalStorageEnabled, True)

        # Load web page and resource files to QWebEngineView
        file_path = os.path.abspath(os.path.join(
            os.path.dirname(__file__), "index.html"))
        local_url = QUrl.fromLocalFile(file_path)
        self.load(local_url)
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
app.exec_()
