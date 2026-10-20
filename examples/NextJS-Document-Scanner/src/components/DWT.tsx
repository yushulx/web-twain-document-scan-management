import {useEffect, useRef } from "react";
import Dynamsoft from "dwt";
import { WebTwain } from "dwt/dist/types/WebTwain";

interface props {
  license?:string;
  onWebTWAINReady?: (dwt:WebTwain) => void;
  width?: string;
  height?: string;
  viewMode?: {cols:number,rows:number};
}

const DWT: React.FC<props> = (props: props)  => {
  const containerID = "dwtcontrolContainer";
  const container = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => {
      const DWObject = Dynamsoft.DWT.GetWebTwain(containerID);
      DWObject.Viewer.width = "100%";
      DWObject.Viewer.height = "100%";
      if (props.width) {
        if (container.current) {
          container.current.style.width = props.width;
        }
      }
      if (props.height) {
        if (container.current) {
          container.current.style.height = props.height;
        }
      }
      if (props.onWebTWAINReady) {
        props.onWebTWAINReady(DWObject);
      }
      if (props.viewMode) {
        DWObject.Viewer.setViewMode(props.viewMode.cols,props.viewMode.rows);
      }
    });
    
    if (props.license) {
      Dynamsoft.DWT.ProductKey = props.license;
    }
    Dynamsoft.DWT.ResourcesPath = "https://unpkg.com/dwt@19.3.0/dist";
    Dynamsoft.DWT.ServiceInstallerLocation = 'https://unpkg.com/dwt@19.3.0/dist/dist/';
    Dynamsoft.DWT.Containers = [{
        WebTwainId: 'dwtObject',
        ContainerId: containerID
    }];

    Dynamsoft.DWT.Load();
  },[]);

  useEffect(()=>{
    const DWObject = Dynamsoft.DWT.GetWebTwain(containerID);
    if (DWObject && props.viewMode) {
      DWObject.Viewer.setViewMode(props.viewMode.cols,props.viewMode.rows);
    }
  },[props.viewMode]);

  return (
    <div ref={container} id={containerID}></div>
  );
}

export default DWT;