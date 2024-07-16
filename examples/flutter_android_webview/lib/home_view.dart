import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

import 'package:webview_flutter/webview_flutter.dart';

class HomeView extends StatefulWidget {
  final WebViewController controller;
  final String title;

  const HomeView({super.key, required this.title, required this.controller});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView>
    with SingleTickerProviderStateMixin {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: () async {
              widget.controller.runJavaScript(
                  'DWObject.ConvertToBase64([DWObject.CurrentImageIndexInBuffer], 1, (result, indices, type) =>{ImageData.postMessage(result._content)})');
            },
          ),
        ],
      ),
      body: WebViewWidget(controller: widget.controller,
          // https://api.flutter.dev/flutter/widgets/AndroidView/gestureRecognizers.html
          gestureRecognizers: <Factory<OneSequenceGestureRecognizer>>{
            Factory<OneSequenceGestureRecognizer>(
              () => EagerGestureRecognizer(),
            ),
          }),
    );
  }
}
