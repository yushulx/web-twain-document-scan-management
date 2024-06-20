import 'dart:convert';
import 'dart:io';

import 'package:android_intent_plus/android_intent.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher_string.dart';

Widget createURLString(String text) {
  // Create a regular expression to match URL strings.
  RegExp urlRegExp = RegExp(
    r'^(https?|http)://[^\s/$.?#].[^\s]*$',
    caseSensitive: false,
    multiLine: false,
  );

  if (urlRegExp.hasMatch(text)) {
    return InkWell(
      onLongPress: () {
        Share.share(text, subject: 'Scan Result');
      },
      child: Text(
        text,
        style: const TextStyle(color: Colors.blue),
      ),
      onTap: () async {
        launchUrlString(text);
      },
    );
  } else {
    return InkWell(
      onLongPress: () async {
        Share.share(text, subject: 'Scan Result');
      },
      child: Text(text),
    );
  }
}

Future<String> saveImage(String base64String) async {
  Uint8List bytes = base64Decode(base64String);

  // Get the app directory
  final directory = await getApplicationDocumentsDirectory();

  // Create the file path
  String imageName = getImageName();
  final filePath = '${directory.path}/$imageName';

  // Write the bytes to the file
  await File(filePath).writeAsBytes(bytes);

  return filePath;
}

Future<List<String>> getImages() async {
  // Get the app directory
  final directory = await getApplicationDocumentsDirectory();

  // Get the list of files in the app directory
  List<FileSystemEntity> files = directory.listSync();

  // Get the file paths
  List<String> filePaths = [];
  for (FileSystemEntity file in files) {
    if (file.path.endsWith('.jpg')) {
      filePaths.add(file.path);
    }
  }

  return filePaths;
}

Future<bool> deleteImage(String path) {
  return File(path).delete().then((value) {
    return true;
  }).catchError((error) {
    return false;
  });
}

String getImageName() {
  // Get the current date and time.
  DateTime now = DateTime.now();

  // Format the date and time to create a timestamp.
  String timestamp =
      '${now.year}${now.month}${now.day}_${now.hour}${now.minute}${now.second}';

  // Create the image file name with the timestamp.
  String imageName = 'image_$timestamp.jpg';

  return imageName;
}

void showToast(String message) {
  const platform = MethodChannel('AndroidNative');
  platform.invokeMethod('showToast', {'message': message});
}

Future<void> launchURL(String url) async {
  await launchUrlString(url);
}

Future<void> launchIntent() async {
  if (Platform.isAndroid) {
    try {
      AndroidIntent intent = const AndroidIntent(
        componentName: 'com.dynamsoft.mobilescan.MainActivity',
        package: 'com.dynamsoft.mobilescan',
      );
      await intent.launch();
    } catch (e) {
      // If the app is not installed, open the Google Play store to install the app.
      launchURL(
          'https://play.google.com/store/apps/details?id=com.dynamsoft.mobilescan');
    }
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
