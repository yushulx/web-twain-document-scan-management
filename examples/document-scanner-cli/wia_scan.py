import os
import argparse
from PIL import Image
import pythoncom
from win32com.client import Dispatch

def list_scanners():
    """List all available WIA scanners"""
    manager = Dispatch("WIA.DeviceManager")
    devices = manager.DeviceInfos
    print("Available scanners:")
    for i in range(1, devices.Count + 1):
        device = devices.Item(i)
        # Check if the device is a scanner (Type = 1)
        if device.Type == 1:
            print(f"  Name: {device.Properties['Name'].Value}")
            print(f"  ID: {device.DeviceID}")
            print(f"  Description: {device.Properties['Description'].Value}")
            print("  ----------------")

def scan_document(output_path="scan.png", scanner_name=None):
    """
    Scan a document using WIA interface and save as image file
    
    Parameters:
        output_path: Path to save scanned image
        scanner_name: Name of specific scanner to use (None shows dialog)
    """
    # Create WIA objects
    wia = Dispatch("WIA.CommonDialog")

    selected_device = None
    if scanner_name:
        manager = Dispatch("WIA.DeviceManager")
        devices = manager.DeviceInfos
        for i in range(1, devices.Count + 1):
            device = devices.Item(i)
            if device.Type == 1 and device.Properties['Name'].Value == scanner_name:
                selected_device = device.Connect()
                break
        
        if not selected_device:
            print(f"Scanner '{scanner_name}' not found!")
            return None

    # Execute the scan
    print("Scanning...")
    
    img = None
    if selected_device is None:
        img = wia.ShowAcquireImage()  # Show scanning dialog
    else:
        img = wia.ShowTransfer(selected_device.Items[1])  # Transfer the scanned image
        
    if img is None:
        print("Scanning cancelled or failed")
        return None
    
    # Create output directory if it doesn't exist
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
    
    # Save the image
    if hasattr(img, "SaveFile"):  # WIA 2.0 compatible method
        img.SaveFile(output_path)
    else:  # Fallback for WIA 1.0 using PIL
        pil_img = Image.fromarray(img)
        pil_img.save(output_path)
    
    print(f"Scan completed. File saved to: {output_path}")
    return output_path


def main():
    parser = argparse.ArgumentParser(description="WIA Scanner Utility")
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