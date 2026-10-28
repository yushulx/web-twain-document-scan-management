# document-scanner-cli

Document Scanning Command Line for Windows, macOS and Linux.

## Windows

1. Use TWAIN.

   ```bash
   python twain_scan.py -L #list scanners
   python twain_scan.py -d "scanner name" -o put.png #scan with a scanner
   ```

2. Use WIA.

   ```bash
   python wia_scan.py -L #list scanners
   python wia_scan.py -d "scanner name" -o put.png #scan with a scanner
   ```

## Linux

Use SANE:

```bash
scanimage -L  #list scanners
scanimage -d "scanner name" -o out.png #scan with a scanner
```

## macOS

An executable file was compiled from a [Swift project](ica) to use the ImageCaptureCore API. You can download it through [this link](https://github.com/tony-xlh/document-scanner-cli/releases/download/builds/docScan).

Usage:

```bash
docScan -L  #list scanners
docScan -d "scanner name" -o out.jpg #scan with a scanner
```


SANE and TWAIN are also supported on macOS.


## Cross-Platform

Use eSCL.

```bash
python escl_scan.py -L #list scanners
python escl_scan.py -d "scanner url" -o out.png #scan with a scanner
```

Use [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/)'s [RESTful API](https://www.dynamsoft.com/web-twain/restfulapi/). It supports scanning with TWAIN, WIA, ICA, SANE and eSCL with one unified API.

```bash
python webtwain_scan.py -L #list scanners
python webtwain_scan.py -d "scanner name" -o out.jpg #scan with a scanner
```


