package com.tonyxlh.documentscanner

import com.tonyxlh.docscan4j.Capabilities
import com.tonyxlh.docscan4j.CapabilitySetup
import com.tonyxlh.docscan4j.DeviceConfiguration
import com.tonyxlh.docscan4j.Scanner

class ScanConfig (
    var scanner: Scanner,
    var deviceConfig: DeviceConfiguration,
    var pixelType: CapabilitySetup
)