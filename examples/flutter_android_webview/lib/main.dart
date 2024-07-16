import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import 'about_view.dart';
import 'history_view.dart';
import 'home_view.dart';
import 'utils.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const MyAppPage(title: 'Web TWAIN Demo'),
    );
  }
}

class MyAppPage extends StatefulWidget {
  const MyAppPage({super.key, required this.title});

  final String title;

  @override
  State<MyAppPage> createState() => _MyAppPageState();
}

class _MyAppPageState extends State<MyAppPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late WebViewController _controller;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(vsync: this, length: 3);

    // late final PlatformWebViewControllerCreationParams params;
    // params = const PlatformWebViewControllerCreationParams();
    _controller = WebViewController(
        onPermissionRequest: (WebViewPermissionRequest request) {
      request.grant();
    })
      // _controller = WebViewController.fromPlatformCreationParams(
      //   params,
      //   onPermissionRequest: (WebViewPermissionRequest request) {
      //     request.grant();
      //   },
      // )
      ..addJavaScriptChannel(
        'ImageData',
        onMessageReceived: (JavaScriptMessage message) {
          saveImage(message.message).then((value) {
            showToast(value);
          });
        },
      )
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            if (progress == 100) {
              String jscode = '''
            let parentElement = document.getElementsByClassName('dcs-main-footer')[0];
            let tags = parentElement .getElementsByTagName('div');
            tags[0].remove();
            tags[6].remove();
            document.getElementsByClassName('dcs-main-content')[0].style.display = 'none';
            ''';
              _controller
                  .runJavaScript(jscode)
                  .then((value) => {setState(() {})});
            }
          },
          onPageStarted: (String url) {},
          onPageFinished: (String url) {},
          onWebResourceError: (WebResourceError error) {},
          onNavigationRequest: (NavigationRequest request) {
            if (request.url.startsWith('intent://')) {
              launchIntent();
              return NavigationDecision.prevent;
            } else if (request.url.endsWith('.apk')) {
              launchURL(
                  'https://play.google.com/store/apps/details?id=com.dynamsoft.mobilescan');
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(
          'https://demo3.dynamsoft.com/web-twain/mobile-online-camera-scanner/'));
    // _controller.clearCache();
    // _controller.clearLocalStorage();

    if (_controller.platform is AndroidWebViewController) {
      // AndroidWebViewController.enableDebugging(true);
      (_controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
      (_controller.platform as AndroidWebViewController)
          .setOnShowFileSelector((params) async {
        final XFile? image =
            await _picker.pickImage(source: ImageSource.gallery);
        if (image != null) {
          return [image.path];
        }
        return [""];
      });
    }
    requestCameraPermission();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: TabBarView(
        controller: _tabController,
        physics: const NeverScrollableScrollPhysics(),
        children: [
          HomeView(title: 'Web TWAIN Demo', controller: _controller),
          const HistoryView(title: 'History'),
          const AboutView(title: 'About the SDK'),
        ],
      ),
      bottomNavigationBar: TabBar(
        labelColor: Colors.blue,
        controller: _tabController,
        tabs: const [
          Tab(icon: Icon(Icons.home), text: 'Home'),
          Tab(icon: Icon(Icons.history_sharp), text: 'History'),
          Tab(icon: Icon(Icons.info), text: 'About'),
        ],
      ),
    );
  }
}
