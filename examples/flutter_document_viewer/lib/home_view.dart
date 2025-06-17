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
      appBar: AppBar(title: Text(widget.title)),
      body: WebViewWidget(controller: widget.controller),
    );
  }
}
