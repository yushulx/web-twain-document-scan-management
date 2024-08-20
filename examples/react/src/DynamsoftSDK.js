import React from 'react';
import Dynamsoft from 'dwt';

export default class DWT extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sourceList: [],
            scanners: [],
            currentScanner: "Looking for devices.."
        };
        this.selectRef = React.createRef();
    }
    DWObject = null;
    containerId = 'dwtcontrolContainer';
    width = "100%";
    height = "600";
    componentDidMount() {
        Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => {
            this.DWObject = Dynamsoft.DWT.GetWebTwain(this.containerId);
            if (this.DWObject) {

                this.DWObject.GetDevicesAsync(Dynamsoft.DWT.EnumDWT_DeviceType.TWAINSCANNER | Dynamsoft.DWT.EnumDWT_DeviceType.TWAINX64SCANNER).then((sources) => {
                    const sourceNames = sources.map(source => source.displayName);
                    this.setState({ scanners: sourceNames, sourceList: sources });
                }).catch((error) => {
                    console.error("Error fetching devices:", error);
                });


            }
        });
        this.loadDWT();
    }
    loadDWT() {
        Dynamsoft.DWT.ResourcesPath = "dwt-resources";
        Dynamsoft.DWT.ProductKey = 'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==';
        Dynamsoft.DWT.Containers = [{ ContainerId: this.containerId, Width: this.width, Height: this.height }];
        this.modulizeInstallJS();
        Dynamsoft.DWT.Load();
    }
    onSourceChange(value) {
        this.setState({ currentScanner: value });
    }

    getSelectedIndex = () => {
        const selectedIndex = this.selectRef.current.selectedIndex;
        console.log("Selected Index:", selectedIndex);
        return selectedIndex
    }
    acquireImage() {
        const selectedIndex = this.selectRef.current.selectedIndex;

        if (!this.state.sourceList || this.state.sourceList.length === 0) {
            alert("No scanner detected. Please connect a scanner and try again.");
            return;
        }

        this.DWObject.IfShowUI = false;
        this.DWObject.SelectDeviceAsync(this.state.sourceList[selectedIndex]).then(() => {

            return this.DWObject.OpenSourceAsync()

        }).then(() => {

            return this.DWObject.AcquireImageAsync({
                IfDisableSourceAfterAcquire: true
            })

        }).then(() => {

            if (this.DWObject) {

                this.DWObject.CloseSource();

            }

        })

            .catch(

                (e) => {

                    console.error(e)

                }

            )
    }
    loadImagesOrPDFs() {
        this.DWObject.IfShowFileDialog = true;
        this.DWObject.Addon.PDF.SetResolution(200);
        this.DWObject.Addon.PDF.SetConvertMode(1/*Dynamsoft.DWT.EnumDWT_ConvertMode.CM_RENDERALL*/);
        this.DWObject.LoadImageEx("", 5 /*Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL*/,
            () => { },
            (errorCode, errorString) => alert(errorString));
    }
    render() {
        return (
            <div style={{ width: "30%", margin: "0 auto" }}>
                <select ref={this.selectRef} style={{ width: "100%" }} tabIndex="1" value={this.state.currentScanner} onChange={(e) => this.onSourceChange(e.target.value)}>
                    {
                        this.state.scanners.length > 0 ?
                            this.state.scanners.map((_name, _index) =>
                                <option value={_name} key={_index}>{_name}</option>
                            )
                            :
                            <option value="Looking for devices..">Looking for devices..</option>
                    }
                </select>
                <button tabIndex="2" style={{ marginRight: "4%", width: "48%" }}
                    onClick={() => this.acquireImage()}
                    disabled={this.state.scanners.length > 0 ? "" : "disabled"}
                >Scan</button>
                <button tabIndex="3" style={{ margin: "2% 0", width: "48%" }}
                    onClick={() => this.loadImagesOrPDFs()}
                    disabled={this.state.scanners.length > 0 ? "" : "disabled"}
                >Load</button>
                <div id={this.containerId}></div>
            </div >
        );
    }
    modulizeInstallJS() {
        let _DWT_Reconnect = Dynamsoft.DWT_Reconnect;
        Dynamsoft.DWT_Reconnect = (...args) => _DWT_Reconnect.call({ Dynamsoft: Dynamsoft }, ...args);
        let __show_install_dialog = Dynamsoft._show_install_dialog;
        Dynamsoft._show_install_dialog = (...args) => __show_install_dialog.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTwainOldPluginNotAllowedCallback = Dynamsoft.OnWebTwainOldPluginNotAllowedCallback;
        Dynamsoft.OnWebTwainOldPluginNotAllowedCallback = (...args) => _OnWebTwainOldPluginNotAllowedCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTwainNeedUpgradeCallback = Dynamsoft.OnWebTwainNeedUpgradeCallback;
        Dynamsoft.OnWebTwainNeedUpgradeCallback = (...args) => _OnWebTwainNeedUpgradeCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTwainPreExecuteCallback = Dynamsoft.OnWebTwainPreExecuteCallback;
        Dynamsoft.OnWebTwainPreExecuteCallback = (...args) => _OnWebTwainPreExecuteCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTwainPostExecuteCallback = Dynamsoft.OnWebTwainPostExecuteCallback;
        Dynamsoft.OnWebTwainPostExecuteCallback = (...args) => _OnWebTwainPostExecuteCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnRemoteWebTwainNotFoundCallback = Dynamsoft.OnRemoteWebTwainNotFoundCallback;
        Dynamsoft.OnRemoteWebTwainNotFoundCallback = (...args) => _OnRemoteWebTwainNotFoundCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnRemoteWebTwainNeedUpgradeCallback = Dynamsoft.OnRemoteWebTwainNeedUpgradeCallback;
        Dynamsoft.OnRemoteWebTwainNeedUpgradeCallback = (...args) => _OnRemoteWebTwainNeedUpgradeCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTWAINDllDownloadFailure = Dynamsoft.OnWebTWAINDllDownloadFailure;
        Dynamsoft.OnWebTWAINDllDownloadFailure = (...args) => _OnWebTWAINDllDownloadFailure.call({ Dynamsoft: Dynamsoft }, ...args);
    }
}
