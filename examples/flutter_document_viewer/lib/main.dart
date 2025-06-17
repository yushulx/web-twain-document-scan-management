import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_document_viewer/history_view.dart';
import 'package:flutter_document_viewer/home_view.dart';
import 'package:flutter_document_viewer/utils.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shelf_static/shelf_static.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;
import 'package:path/path.dart' as p;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (Platform.isAndroid) {
    // Serve files from assets/web

    final dir = await getTemporaryDirectory();
    final path = p.join(dir.path, 'web');
    // Create the target directory
    final webDir = Directory(path)..createSync(recursive: true);

    // List of files to copy
    final files = ['index.html', 'full.json', 'main.css', 'main.js'];

    for (var filename in files) {
      final ByteData data = await rootBundle.load('assets/web/$filename');
      final file = File(p.join(webDir.path, filename));
      await file.writeAsBytes(data.buffer.asUint8List());
    }

    final handler = createStaticHandler(
      webDir.path,
      defaultDocument: 'index.html',
      serveFilesOutsidePath: true,
    );

    // Start server on localhost:8080
    try {
      final server = await shelf_io.serve(handler, 'localhost', 8080);
      print('Serving at http://${server.address.host}:${server.port}');
    } catch (e) {
      print('Failed to start server: $e');
    }
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(appBarTheme: AppBarTheme(backgroundColor: Colors.blue)),
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

class _MyHomePageState extends State<MyHomePage>
    with SingleTickerProviderStateMixin {
  late final WebViewController _controller;
  final ImagePicker _picker = ImagePicker();
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(vsync: this, length: 2);

    if (Platform.isAndroid) {
      _controller =
          WebViewController()
            ..setJavaScriptMode(JavaScriptMode.unrestricted)
            ..enableZoom(true)
            ..setBackgroundColor(Colors.transparent)
            ..setNavigationDelegate(NavigationDelegate())
            ..addJavaScriptChannel(
              'SaveFile',
              onMessageReceived: (JavaScriptMessage message) async {
                List<dynamic> byteList = jsonDecode(message.message);
                Uint8List pdfBytes = Uint8List.fromList(byteList.cast<int>());

                String filename = await saveFile(pdfBytes);
                Fluttertoast.showToast(
                  msg: "File saved as: $filename",
                  toastLength: Toast.LENGTH_LONG,
                );
              },
            )
            ..platform.setOnPlatformPermissionRequest((request) {
              debugPrint(
                'Permission requested by web content: ${request.types}',
              );
              request.grant(); // Automatically grant the requested permissions
            })
            // ..loadRequest(
            //   Uri.parse('https://demo.dynamsoft.com/mobile-web-capture/'),
            // );
            // ..loadFlutterAsset('assets/web/index.html');
            ..loadRequest(Uri.parse('http://localhost:8080/index.html'));
    } else {
      _controller =
          WebViewController()
            ..setJavaScriptMode(JavaScriptMode.unrestricted)
            ..enableZoom(true)
            ..setBackgroundColor(Colors.transparent)
            ..setNavigationDelegate(NavigationDelegate())
            ..platform.setOnPlatformPermissionRequest((request) {
              debugPrint(
                'Permission requested by web content: ${request.types}',
              );
              request.grant();
            })
            ..loadFlutterAsset('assets/web/index.html');
    }

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
      // appBar: AppBar(
      //   backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      //   title: Text(widget.title),
      // ),
      body: TabBarView(
        controller: _tabController,
        physics: const NeverScrollableScrollPhysics(),
        children: [
          HomeView(title: 'Document Viewer', controller: _controller),
          const HistoryView(title: 'History'),
        ],
      ),
      bottomNavigationBar: TabBar(
        labelColor: Colors.blue,
        controller: _tabController,
        tabs: const [
          Tab(icon: Icon(Icons.home), text: 'Home'),
          Tab(icon: Icon(Icons.history_sharp), text: 'History'),
        ],
      ),
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
