import 'dart:io';

import 'package:flutter/material.dart';

class DocumentView extends StatelessWidget {
  final String filePath;
  const DocumentView({super.key, required this.filePath});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Document Viewer'),
      ),
      body: Center(child: Image.file(File(filePath))),
    );
  }
}
