//
//  main.swift
//  docScan
//
//  Created by xulihang on 2025/7/28.
//

import Foundation
import ImageCaptureCore
import AppKit


class ScannerManager: NSObject, ICDeviceBrowserDelegate, ICScannerDeviceDelegate {
    func device(_ device: ICDevice, didCloseSessionWithError error: (any Error)?) {
        print("did close")
    }
    
    func didRemove(_ device: ICDevice) {
        print("did remove")
    }
    
    func device(_ device: ICDevice, didOpenSessionWithError error: (any Error)?) {
        print("did open")
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) { [weak self] in
            guard let self = self else { return }
            guard let scanner = currentScanner else { return }
            scanner.transferMode = .fileBased
            scanner.downloadsDirectory = URL(fileURLWithPath: NSTemporaryDirectory())
            scanner.documentName = "scan"
            scanner.documentUTI = kUTTypeJPEG as String
            if let functionalUnit = scanner.selectedFunctionalUnit as? ICScannerFunctionalUnit {
                let resolutionIndex = functionalUnit.supportedResolutions.integerGreaterThanOrEqualTo(300) ?? functionalUnit.supportedResolutions.last
                if let resolutionIndex = resolutionIndex ?? functionalUnit.supportedResolutions.last {
                    functionalUnit.resolution = resolutionIndex
                }
                
                let a4Width: CGFloat = 210.0 // mm
                let a4Height: CGFloat = 297.0 // mm
                let widthInPoints = a4Width * 72.0 / 25.4 // convert to point
                let heightInPoints = a4Height * 72.0 / 25.4
                
                functionalUnit.scanArea = NSMakeRect(0, 0, widthInPoints, heightInPoints)
                functionalUnit.pixelDataType = .RGB
                functionalUnit.bitDepth = .depth8Bits

                scanner.requestScan()
            }
        }
    }
    
    private var deviceBrowser: ICDeviceBrowser!
    private var scanners: [ICScannerDevice] = []
    private var currentScanner: ICScannerDevice?
    private var scanCompletionHandler: ((Result<URL, Error>) -> Void)?
    private var targetURL: URL?
    
    override init() {
        super.init()
        setupDeviceBrowser()
    }
    
    private func setupDeviceBrowser() {
        deviceBrowser = ICDeviceBrowser()
        deviceBrowser.delegate = self
        let mask = ICDeviceTypeMask(rawValue:
                    ICDeviceTypeMask.scanner.rawValue |
                    ICDeviceLocationTypeMask.local.rawValue |
                    ICDeviceLocationTypeMask.bonjour.rawValue |
                    ICDeviceLocationTypeMask.shared.rawValue)
        deviceBrowser.browsedDeviceTypeMask = mask!
        deviceBrowser.start()
    }
    
    func listScanners(completion: @escaping ([ICScannerDevice]) -> Void) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            completion(self.scanners)
        }
    }
    
    // MARK: - ICScannerDeviceDelegate
    
    func scannerDevice(_ scanner: ICScannerDevice, didScanTo url: URL) {
        print("did scan to")
        print(url.absoluteString)
        guard let targetURL = targetURL else {
            scanCompletionHandler?(.failure(NSError(domain: "ScannerError", code: -2, userInfo: [NSLocalizedDescriptionKey: "No target URL set"])))
            return
        }
        do {
            try FileManager.default.moveItem(at: url, to: targetURL)
            scanCompletionHandler?(.success(targetURL))
        } catch {
            scanCompletionHandler?(.failure(error))
        }
    }
    
    // MARK: - Scan Operations
    
    func startScan(scanner: ICScannerDevice, outputPath: String, completion: @escaping (Result<URL, Error>) -> Void) {
        currentScanner = scanner
        scanCompletionHandler = completion
        targetURL = URL(fileURLWithPath: outputPath)
        
        scanner.delegate = self
        scanner.requestOpenSession()
        

    }
    
    // MARK: - ICDeviceBrowserDelegate
    
    func deviceBrowser(_ browser: ICDeviceBrowser, didAdd device: ICDevice, moreComing: Bool) {
        guard let scanner = device as? ICScannerDevice else { return }
        scanners.append(scanner)
    }
    
    func deviceBrowser(_ browser: ICDeviceBrowser, didRemove device: ICDevice, moreGoing: Bool) {
        if let index = scanners.firstIndex(where: { $0 == device }) {
            scanners.remove(at: index)
        }
    }
}

func main() {
    let scannerManager = ScannerManager()
    // Parse command line arguments
    var outputPath: String?
    var listScannersFlag = false
    var selectedScannerName: String?
    let arguments = CommandLine.arguments
    for i in 0..<arguments.count {
        switch arguments[i] {
        case "-o", "--output":
            if i+1 < arguments.count {
                outputPath = arguments[i+1]
            }
        case "-L":
            listScannersFlag = true
        case "-d":
            if i+1 < arguments.count {
                selectedScannerName = arguments[i+1]
            } else {
                print("Error: -d requires a scanner name argument")
                exit(1)
            }
        default:
            break
        }
    }
    
    // Handle -L flag to list scanners
    if listScannersFlag {
        scannerManager.listScanners { scanners in
            if scanners.isEmpty {
                print("No scanners available.")
            } else {
                print("Available scanners:")
                for (index, scanner) in scanners.enumerated() {
                    print("\(index): \(scanner.name ?? "Unknown Scanner")")
                }
            }
            exit(0)
        }
        RunLoop.current.run()
        return
    }
    
    // Check required parameters
    if outputPath == nil {
        print("Usage: docScan [options]")
        print("Options:")
        print("  -L          List all available scanners")
        print("  -d <name>   Specify scanner by name")
        print("  -o <path>   Output file path")
        exit(1)
    }
    
    scannerManager.listScanners { scanners in
        if scanners.isEmpty {
            print("No scanners found.")
            exit(1)
        }
        
        // Find the scanner with matching name
        guard var selectedScanner = scanners.first else {
            print("No scanners not found.")
            exit(1)
        }
        
        if selectedScannerName != "" {
            for scanner in scanners {
                if scanner.name == selectedScannerName {
                    selectedScanner = scanner
                    break
                }
            }
        }
        
        print("Selected scanner: \(selectedScanner.name ?? "Unknown")")
        
        scannerManager.startScan(scanner: selectedScanner, outputPath: outputPath!) { result in
            switch result {
            case .success(let url):
                print("Scan successfully saved to: \(url.path)")
            case .failure(let error):
                print("Scan failed: \(error.localizedDescription)")
            }
            exit(0)
        }
    }
    
    RunLoop.current.run()
}

main()
