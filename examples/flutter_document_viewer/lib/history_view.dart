import 'package:flutter/material.dart';
import 'package:open_file/open_file.dart';
import 'package:share_plus/share_plus.dart';

import 'utils.dart';

class HistoryView extends StatefulWidget {
  const HistoryView({super.key, required this.title});

  final String title;

  @override
  State<HistoryView> createState() => _HistoryViewState();
}

class _HistoryViewState extends State<HistoryView> {
  List<String> _results = [];
  int selectedValue = -1;

  @override
  void initState() {
    super.initState();

    getFiles().then((value) {
      setState(() {
        _results = value;
      });
    });
  }

  Widget createListView(BuildContext context, List<String> results) {
    return ListView.builder(
      itemCount: results.length,
      itemBuilder: (context, index) {
        return RadioListTile<int>(
          value: index,
          groupValue: selectedValue,
          title: Text(results[index]),
          onChanged: (int? value) {
            setState(() {
              selectedValue = value!;
            });
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        actions: [
          IconButton(
            icon: const Icon(Icons.info),
            onPressed: () async {
              if (selectedValue == -1) {
                return;
              }
              await OpenFile.open(_results[selectedValue]);
            },
          ),
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () async {
              if (selectedValue == -1) {
                return;
              }
              await SharePlus.instance.share(
                ShareParams(
                  text: 'Check out this image!',
                  files: [XFile(_results[selectedValue])],
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.delete),
            onPressed: () async {
              if (selectedValue == -1) {
                return;
              }
              bool isDeleted = await deleteFile(_results[selectedValue]);
              if (isDeleted) {
                setState(() {
                  _results.removeAt(selectedValue);
                  selectedValue = -1;
                });
              }
            },
          ),
        ],
      ),
      body: Center(
        child: Stack(
          children: [
            SizedBox(height: MediaQuery.of(context).size.height),
            if (_results.isNotEmpty)
              SizedBox(
                width: MediaQuery.of(context).size.width,
                height:
                    MediaQuery.of(context).size.height -
                    200 -
                    MediaQuery.of(context).padding.top,
                child: createListView(context, _results),
              ),
          ],
        ),
      ),
    );
  }
}
