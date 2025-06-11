import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

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
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  late final WebViewController _controller;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();

    _controller =
        WebViewController()
          ..setJavaScriptMode(JavaScriptMode.unrestricted)
          ..enableZoom(true)
          ..setBackgroundColor(Colors.transparent)
          ..setNavigationDelegate(NavigationDelegate())
          ..platform.setOnPlatformPermissionRequest((request) {
            debugPrint('Permission requested by web content: ${request.types}');
            request.grant(); // Automatically grant the requested permissions
          })
          // ..loadRequest(
          //   Uri.parse('https://demo.dynamsoft.com/mobile-web-capture/'),
          // );
          ..loadFlutterAsset('assets/web/index.html');

    if (_controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      (_controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
      (_controller.platform as AndroidWebViewController).setOnShowFileSelector((
        params,
      ) async {
        final XFile? image = await _picker.pickImage(
          source: ImageSource.gallery,
        );
        if (image != null) {
          return ['file://${image.path}'];
        }
        return [""];
      });
    }
    requestCameraPermission();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: WebViewWidget(controller: _controller),
    );
  }
}

Future<void> requestCameraPermission() async {
  final status = await Permission.camera.request();
  if (status == PermissionStatus.granted) {
    // Permission granted.
  } else if (status == PermissionStatus.denied) {
    // Permission denied.
  } else if (status == PermissionStatus.permanentlyDenied) {
    // Permission permanently denied.
  }
}
