import "./App.css";
import React from "react";
import DocumentViewer from "./components/DWT";
import { WebTwain } from "dwt/dist/types/WebTwain";
import { Select, Button, Layout, Collapse, Checkbox, Radio, RadioChangeEvent, InputNumber  } from 'antd';
import { DeviceConfiguration } from "dwt/dist/types/WebTwain.Acquire";
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';
import { register } from '@tauri-apps/api/globalShortcut';
import { resourceDir, join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/api/shell';
import { message } from '@tauri-apps/api/dialog';

const { Panel } = Collapse;
const { Content, Sider } = Layout;
const { Option } = Select;

function App() {
  const hasPermission  = React.useRef('denied');
  const [scanners,setScanners] = React.useState([] as string[]);
  const [ADF,setADF] = React.useState(false);
  const [showUI,setShowUI] = React.useState(false);
  const dwt = React.useRef<WebTwain>();
  const [viewMode, setViewMode] = React.useState({cols:2,rows:2});
  const [selectedScanner,setSelectedScanner] = React.useState("");
  const [selectedPixelType, setSelectedPixelType] = React.useState(0);
  const [selectedResolution, setSelectedResolution] = React.useState(100);
  React.useEffect(()=>{
    console.log("load page");
    askForPermission();
    registerShortCuts();
  },[]);

  const registerShortCuts = async () => {
    await register('CommandOrControl+Shift+C', () => {
      scan();
    });
  }
  const askForPermission = async () => {
    const permissionGranted = await isPermissionGranted();
    console.log(permissionGranted);
    if (!permissionGranted) {
      const permission = await requestPermission();
      console.log(permission);
      hasPermission.current = permission;
    }else{
      hasPermission.current = "granted";
    }
  }

  const scan = () => {
    const DWObject = dwt.current;
    if (DWObject) {
      let deviceConfiguration:DeviceConfiguration = {};
      deviceConfiguration.IfShowUI = showUI;
      deviceConfiguration.IfFeederEnabled = ADF;
      deviceConfiguration.SelectSourceByIndex = scanners.indexOf(selectedScanner);
      deviceConfiguration.PixelType = selectedPixelType;
      deviceConfiguration.Resolution = selectedResolution;
      console.log(deviceConfiguration);
      DWObject.AcquireImage(deviceConfiguration);
    }
  }

  const save = () => {
    const DWObject = dwt.current;
    if (DWObject) {
      const onSuccess = () => {
        if (hasPermission.current == "granted") {
          sendNotification({ title: 'Document Scanner', body: 'Succeeded' });
        }
      }
      const onFailure = () => {
        if (hasPermission.current == "granted") {
          sendNotification({ title: 'Document Scanner', body: 'Failed' });
        }
      }
      DWObject.SaveAllAsPDF("Documents.pdf",onSuccess,onFailure);
    }
  }

  const onChange = (key: string | string[]) => {
    console.log(key);
  };

  const onWebTWAINReady = (instance:WebTwain) => {
    dwt.current = instance;
    loadScannersList();
  }

  const onWebTWAINNotFound = async () => {
    console.log("not found");
    await message('Dynamsoft Service has not been installed. Please install it and then restart the program.', { title: 'Document Scanner', type: 'warning' });
    const resourceDirPath = await resourceDir();
    const distPath = await join(resourceDirPath, 'dist');
    await open(distPath);
  }

  const loadScannersList = () => {
    const DWObject = dwt.current;
    if (DWObject) {
      const names = DWObject.GetSourceNames(false) as string[];
      setScanners(names);
      if (names.length>0) {
        setSelectedScanner(names[0]);
      }
    }
  }

  const onSelectedScannerChange = (value:string) => {
    setSelectedScanner(value);
  }

  const showImageEditor = () => {
    const DWObject = dwt.current;
    if (DWObject) {
      let imageEditor = DWObject.Viewer.createImageEditor();
      imageEditor.show();
    }
  }

  return (
    <Layout hasSider>
      <Layout style={{ marginRight: 300 }}>
        <Content className="content">
            <DocumentViewer
              width="100%"
              height="100%"
              onWebTWAINReady={onWebTWAINReady}
              onWebTWAINNotFound={onWebTWAINNotFound}
              viewMode={viewMode}
            ></DocumentViewer>
        </Content>
      </Layout>
      <Sider 
        width='300px'
        theme='light'
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <Collapse className="controls" defaultActiveKey={['1']} onChange={onChange}>
          <Panel header="SCAN" key="1">
            Select Scanner:
            <Select 
              onChange={onSelectedScannerChange}
              value={selectedScanner}
              style={{width:"100%"}}>
              {scanners.map(scanner => 
                <Option 
                  key={scanner} 
                  value={scanner}
                >{scanner}</Option>
              )}
            </Select>
            <div>
              <Checkbox checked={ADF} onChange={()=>{setADF(!ADF)}}>ADF</Checkbox>
              <Checkbox checked={showUI} onChange={()=>{setShowUI(!showUI)}}>Show UI</Checkbox>
            </div>
            <div>
              Pixel Type:
              <Radio.Group onChange={(e:RadioChangeEvent)=>{setSelectedPixelType(e.target.value)}} value={selectedPixelType}>
                <Radio value={0}>B&W</Radio>
                <Radio value={1}>Gray</Radio>
                <Radio value={2}>Color</Radio>
              </Radio.Group>
              Resolution:
              <Select 
                style={{width:"100%"}}
                onChange={(value)=>{setSelectedResolution(value)}}
                value={selectedResolution}>
                  <Option value="100">100</Option>
                  <Option value="200">200</Option>
                  <Option value="300">300</Option>
              </Select>
            </div>
            <Button onClick={scan}>Scan</Button>
          </Panel>
          <Panel header="VIEWER" key="2">
            Viewer Mode:
            <div>
              <InputNumber min={-1} max={5} value={viewMode.cols} onChange={(value)=>{setViewMode({cols:value,rows:viewMode.rows})}} />
              x
              <InputNumber min={-1} max={5} value={viewMode.rows} onChange={(value)=>{setViewMode({cols:viewMode.cols,rows:value})}} />
            </div>
            <Button onClick={showImageEditor}>Show Image Editor</Button>  
          </Panel>
          <Panel header="SAVE" key="3">
          <Button onClick={save}>Save as PDF</Button>
          </Panel>
        </Collapse>
      </Sider>
  </Layout>
  );
}

export default App;
