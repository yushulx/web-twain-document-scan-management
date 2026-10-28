import os
import argparse
from PIL import Image
import twain
from io import BytesIO

def list_scanners():
    """List all available TWAIN scanners"""
    with twain.SourceManager() as sm:
        for source in sm.source_list:
            print(source)

def scan_document(output_path="scan.png", scanner_name=None):
    """
    Scan a document using TWAIN interface and save as image file
    
    Parameters:
        output_path: Path to save scanned image
        scanner_name: Name of specific scanner to use (None shows dialog)
    """
    with twain.SourceManager() as sm:
        src = None
        if scanner_name is None:
            src = sm.open_source()
        else:
            src = sm.open_source(scanner_name)
        if src:
            src.request_acquire(show_ui=False, modal_ui=False)
            (handle, remaining_count) = src.xfer_image_natively()
            bmp_bytes = twain.dib_to_bm_file(handle)
            img = Image.open(BytesIO(bmp_bytes), formats=["bmp"])
            img.save(output_path)

def main():
    parser = argparse.ArgumentParser(description="TWAIN Scanner Utility")
    parser.add_argument("-L", "--list", action="store_true", 
                        help="List available scanners")
    parser.add_argument("-d", "--device", type=str,
                        help="Name of scanner device to use")
    parser.add_argument("-o", "--output", type=str, default="scan.png",
                        help="Output file path (default: scan.png)")
    
    args = parser.parse_args()
    
    if args.list:
        list_scanners()
    else:
        scan_document(output_path=args.output, scanner_name=args.device)

if __name__ == "__main__":
    main()