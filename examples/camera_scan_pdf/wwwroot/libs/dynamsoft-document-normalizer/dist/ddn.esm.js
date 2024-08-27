/*!
* Dynamsoft JavaScript Library
* @product Dynamsoft Document Normalizer JS Edition
* @website http://www.dynamsoft.com
* @copyright Copyright 2024, Dynamsoft Corporation
* @author Dynamsoft
* @version 2.0.20
* @fileoverview Dynamsoft JavaScript Library for Document Normalizer
* More info on ddn JS: https://www.dynamsoft.com/document-normalizer/sdk-javascript/
*/
import{engineResourcePaths as d,workerAutoResources as s,mapPackageRegister as n,compareVersion as t,innerVersions as e}from"dynamsoft-core";const r="undefined"==typeof self,i=(()=>{if(!r&&document.currentScript){let d=document.currentScript.src,s=d.indexOf("?");if(-1!=s)d=d.substring(0,s);else{let s=d.indexOf("#");-1!=s&&(d=d.substring(0,s))}return d.substring(0,d.lastIndexOf("/")+1)}return"./"})();null==d.ddn&&(d.ddn=i),s.ddn={js:!1,wasm:!0},n.ddn={};const o="1.0.0";d.std.version&&t(d.std.version,o)<0&&(d.std.version=o,d.std.path=i+`../../dynamsoft-capture-vision-std@${o}/dist/`);const c="2.0.30";d.dip.version&&t(d.dip.version,c)<0&&(d.dip.version=c,d.dip.path=i+`../../dynamsoft-image-processing@${c}/dist/`);class a{static getVersion(){const d=e.ddn&&e.ddn.wasm,s=e.ddn&&e.ddn.worker;return`2.0.20(Worker: ${s||"Not Loaded"}, Wasm: ${d||"Not Loaded"})`}}export{a as DocumentNormalizerModule};
