import 'dart:io';
import 'dart:typed_data';

import 'package:path_provider/path_provider.dart';

Future<String> saveFile(Uint8List pdfBytes) async {
  // Get the app directory
  final directory = await getApplicationDocumentsDirectory();

  // Create the file path
  String filename = getFileName();
  final filePath = '${directory.path}/$filename';

  // Write the bytes to the file
  await File(filePath).writeAsBytes(pdfBytes);

  return filePath;
}

Future<List<String>> getFiles() async {
  // Get the app directory
  final directory = await getApplicationDocumentsDirectory();

  // Get the list of files in the app directory
  List<FileSystemEntity> files = directory.listSync();

  // Get the file paths
  List<String> filePaths = [];
  for (FileSystemEntity file in files) {
    if (file.path.endsWith('.pdf')) {
      filePaths.add(file.path);
    }
  }

  return filePaths;
}

String getFileName() {
  // Get the current date and time.
  DateTime now = DateTime.now();

  // Format the date and time to create a timestamp.
  String timestamp =
      '${now.year}${now.month}${now.day}_${now.hour}${now.minute}${now.second}';

  // Create the file name with the timestamp.
  String name = '$timestamp.pdf';

  return name;
}

Future<bool> deleteFile(String path) {
  return File(path)
      .delete()
      .then((value) {
        return true;
      })
      .catchError((error) {
        return false;
      });
}
