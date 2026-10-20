import '../styles/index.scss';
import { DocumentScanner } from './documentscanner'; // eslint-disable-line
let DWObject;
window.onload = function(){
  let scanner = document.querySelector("document-scanner");
  scanner.addEventListener("initialized",function(e){
    DWObject = e.detail.DWObject;
    console.log(DWObject);
  });
};

