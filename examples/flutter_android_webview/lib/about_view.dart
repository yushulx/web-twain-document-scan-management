import 'package:flutter/material.dart';
import 'utils.dart';

class AboutView extends StatelessWidget {
  final String title;
  const AboutView({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
      ),
      body: Column(
        children: [
          const Align(
            alignment: Alignment.topCenter,
            child: Padding(
              padding: EdgeInsets.all(18.0),
              child: Text(
                'A browser-based document scanning SDK specifically designed for web applications. With just a few lines of JavaScript code, you can develop robust applications to scan documents in all common web browsers.',
                style: TextStyle(
                  color: Colors.black,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          Align(
            alignment: Alignment.topCenter,
            child: Padding(
              padding: const EdgeInsets.all(18.0),
              child: createURLString(
                  'https://www.dynamsoft.com/web-twain/overview/'),
            ),
          ),
        ],
      ),
    );
  }
}
