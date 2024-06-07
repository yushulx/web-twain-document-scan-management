import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:webview_windows/webview_windows.dart';
import 'package:path/path.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const MyHomePage(title: 'Flutter Dynamic Web TWAIN Desktop'),
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
  final List<String> _sourceNames = [];
  String _selectedItem = '';
  final _controller = WebviewController();

  @override
  void initState() {
    super.initState();
    initPlatformState();
  }

  Future<void> initPlatformState() async {
    try {
      await _controller.initialize();
      final assetsDirectory = join(dirname(Platform.resolvedExecutable), 'data',
          'flutter_assets', "lib/assets/index.html");

      await _controller.loadUrl(Uri.file(assetsDirectory).toString());

      _controller.webMessage.listen((event) {
        if (event['event'] == null) return;

        if (event['event'] == 'sourceNames') {
          _sourceNames.clear();
          for (var item in event['data']) {
            _sourceNames.add(item.toString());
          }

          if (_sourceNames.isNotEmpty) {
            setState(() {
              _selectedItem = _sourceNames[0];
            });
          }
        }
      });
    } catch (e) {
      rethrow;
    }

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Stack(
          children: [
            Webview(
              _controller,
            ),
            Positioned(
              top: 10,
              left: 10,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  DropdownButton<String>(
                    value: _selectedItem,
                    items: _sourceNames
                        .map<DropdownMenuItem<String>>((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      );
                    }).toList(),
                    onChanged: (String? newValue) {
                      if (newValue == null || newValue == '') return;
                      setState(() {
                        _selectedItem = newValue;
                      });
                    },
                  ),
                  ElevatedButton(
                      onPressed: () async {
                        await _controller.postWebMessage(json.encode({
                          "event": "acquire",
                          "index": _sourceNames.indexOf(_selectedItem)
                        }));
                      },
                      child: const Text("Scan Documents")),
                  const SizedBox(
                    width: 10,
                    height: 10,
                  ),
                  ElevatedButton(
                      onPressed: () async {
                        await _controller
                            .postWebMessage(json.encode({"event": "load"}));
                      },
                      child: const Text("Load Documents")),
                  const SizedBox(
                    width: 10,
                    height: 10,
                  ),
                  ElevatedButton(
                      onPressed: () async {
                        await _controller.postWebMessage(
                            json.encode({"event": "removeSelected"}));
                      },
                      child: const Text("Remove Selected")),
                  const SizedBox(
                    height: 10,
                    width: 10,
                  ),
                  ElevatedButton(
                      onPressed: () async {
                        await _controller.postWebMessage(
                            json.encode({"event": "removeAll"}));
                      },
                      child: const Text("Remove All")),
                  const SizedBox(
                    width: 10,
                    height: 10,
                  ),
                  ElevatedButton(
                      onPressed: () async {
                        await _controller
                            .postWebMessage(json.encode({"event": "download"}));
                      },
                      child: const Text("Download Documents"))
                ],
              ),
            )
          ],
        ),
      ), // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
}
