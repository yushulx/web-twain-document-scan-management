import os
import argparse
from PIL import Image
from dynamsoftservice import ScannerController, ScannerType

license_key = "LICENSE-KEY"
host = "http://127.0.0.1:18622"
scannerController = ScannerController()


def list_scanners():
    """List all available scanners"""
    scanners = scannerController.getDevices(host)
    return scanners

def scan_document(output_path="scan.png", scanner_name=None):
    """
    Scan a document using Web TWAIN service and save as image file
    
    Parameters:
        output_path: Path to save scanned image
        scanner_name: Name of specific scanner to use (None shows dialog)
    """
    scanners = list_scanners()
    selectedScanner = None
    if scanner_name is not None:
        for scanner in scanners:
            if scanner['name'] == scanner_name:
                selectedScanner = scanner
                break
    
    parameters = {
        "license": license_key
    }

    if selectedScanner is not None:
        parameters["device"] = selectedScanner["device"]
        
    parameters["config"] = {
        "IfShowUI": False,
        "PixelType": 2,
        "Resolution": 200,
        "IfFeederEnabled": False,
        "IfDuplexEnabled": False,
    }
    
    job = scannerController.createJob(host, parameters)
    print(job)
    if "jobuid" in job:
        job_id = job["jobuid"]
        stream = scannerController.getImageStreams(host,job_id)[0]
        with open(output_path,"wb") as f:
            f.write(stream)
            f.close()
    return output_path


def main():
    parser = argparse.ArgumentParser(description="Scanner Utility")
    parser.add_argument("-L", "--list", action="store_true", 
                        help="List available scanners")
    parser.add_argument("-d", "--device", type=str,
                        help="Name of scanner device to use")
    parser.add_argument("-o", "--output", type=str, default="scan.png",
                        help="Output file path (default: scan.png)")
    
    args = parser.parse_args()
    
    if args.list:
        for scanner in list_scanners():
            print(scanner["name"])
    else:
        scan_document(output_path=args.output, scanner_name=args.device)

if __name__ == "__main__":
    main()