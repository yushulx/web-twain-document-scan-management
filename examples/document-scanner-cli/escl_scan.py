from zeroconf import ServiceBrowser, Zeroconf
import time
import argparse
from requests import get as requests_get, post as requests_post

def scan(scanner_address, output_path="scanned.jpg"):
    xml = '''<scan:ScanSettings xmlns:scan="http://schemas.hp.com/imaging/escl/2011/05/03" xmlns:dd="http://www.hp.com/schemas/imaging/con/dictionaries/1.0/" xmlns:dd3="http://www.hp.com/schemas/imaging/con/dictionaries/2009/04/06" xmlns:fw="http://www.hp.com/schemas/imaging/con/firewall/2011/01/05" xmlns:scc="http://schemas.hp.com/imaging/escl/2011/05/03" xmlns:pwg="http://www.pwg.org/schemas/2010/12/sm"><pwg:Version>2.1</pwg:Version><scan:Intent>Photo</scan:Intent><pwg:ScanRegions><pwg:ScanRegion><pwg:Height>3300</pwg:Height><pwg:Width>2550</pwg:Width><pwg:XOffset>0</pwg:XOffset><pwg:YOffset>0</pwg:YOffset></pwg:ScanRegion></pwg:ScanRegions><pwg:InputSource>Platen</pwg:InputSource><scan:DocumentFormatExt>image/jpeg</scan:DocumentFormatExt><scan:XResolution>300</scan:XResolution><scan:YResolution>300</scan:YResolution><scan:ColorMode>Grayscale8</scan:ColorMode><scan:CompressionFactor>25</scan:CompressionFactor><scan:Brightness>1000</scan:Brightness><scan:Contrast>1000</scan:Contrast></scan:ScanSettings>'''

    resp = requests_post('http://{0}/eSCL/ScanJobs'.format(scanner_address), data=xml, headers={'Content-Type': 'text/xml'})
    if resp.status_code == 201:
        url = '{0}/NextDocument'.format(resp.headers['Location'])
        r = requests_get(url) 
        with open(output_path,'wb') as f:
            f.write(r.content)
    
class ESCLScannerListener:
    def __init__(self):
        self.scanners = []

    def add_service(self, zeroconf, type, name):
        info = zeroconf.get_service_info(type, name)
        if info:
            addresses = ["%s:%d" % (addr, info.port) for addr in info.addresses]
            scanner_info = {
                'name': name,
                'type': type,
                'addresses': info.addresses,
                'port': info.port,
                'properties': info.properties
            }
            self.scanners.append(scanner_info)

    def remove_service(self, zeroconf, type, name):
        print(f"Scanner removed: {name}")

def discover_escl_scanners(timeout=2):
    zeroconf = Zeroconf()
    listener = ESCLScannerListener()
    browser = ServiceBrowser(zeroconf, "_uscan._tcp.local.", listener)
    print(f"Discovering ESCL scanners for {timeout} seconds...")
    time.sleep(timeout)
    
    zeroconf.close()
    return listener.scanners

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='ESCL Scanner CLI Tool')
    parser.add_argument('-L', '--list', action='store_true', help='List all discovered ESCL scanners')
    parser.add_argument('-d', '--device', help='Specify scanner address (e.g., HP6C02E0BCF77F.local)')
    parser.add_argument('-o', '--output', help='Specify output file path (default: scanned.jpg)')
    args = parser.parse_args()

    # List scanners if requested
    if args.list:
        scanners = discover_escl_scanners()
        print("\nDiscovered ESCL Scanners Summary:")
        for i, scanner in enumerate(scanners, 1):
            print(f"{i}. {scanner['name']}")
            if scanner['properties']:
                print("Properties:")
                for key, value in scanner['properties'].items():
                    try:
                        # Try to decode bytes to string
                        decoded_key = key.decode('utf-8')
                        decoded_value = value.decode('utf-8')
                        print(f"  {decoded_key}: {decoded_value}")
                    except:
                        print(f"  {key}: {value} (binary data)")
            print("-" * 40)
        if not scanners:
            print("No ESCL scanners found on the network.")
        exit(0)

    # Scan if device is specified
    if args.device:
        output_path = args.output if args.output else "scanned.jpg"
        scan(args.device, output_path)
        print(f"Scan completed successfully. Output saved to {output_path}")
    else:
        print("Error: Please specify a scanner with -d or use -L to list available scanners")
        exit(1)