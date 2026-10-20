import { Index } from "flexsearch";
import localForage from "localforage";
import { getUrlParam } from './utils';

let indexStore = localForage.createInstance({
  name: "index"
});

const documentIndex = new Index();
window.documentIndex = documentIndex;

window.onload = async function(){
  await LoadIndexFromIndexedDB();
  checkQuery();
};

document.getElementsByClassName("index-btn")[0].addEventListener("click",function(){
  IndexDocument();
  alert("Indexed");
});

document.getElementsByClassName("search-btn")[0].addEventListener("click",function(){
  search();
});

function checkQuery(){
  const query = getUrlParam("query");
  if (query) {
    document.getElementById("query").value = query;
    search();
  }
}


function SaveIndexToIndexedDB(){
  return new Promise(function(resolve){
    documentIndex.export(async function(key, data){ 
      // do the saving as async
      console.log(key);
      await indexStore.setItem(key, data);
      resolve();
    });
  });
}

async function LoadIndexFromIndexedDB(){
  console.log("load");
  const keys = await indexStore.keys();
  console.log(keys);
  for (const key of keys) {
    const content = await indexStore.getItem(key);
    documentIndex.import(key, content);
  }
}

async function search(){
  if (Object.keys(documentIndex.register).length === 0) {
    await IndexDocument();
  }
  updateStatus("Searching...");
  document.getElementsByClassName("search-result-container")[0].style.display = "";
  const query = document.getElementById("query").value;
  const startTime = Date.now();
  const results = documentIndex.search(query);
  const endTime = Date.now();
  console.log(results);
  const info = document.getElementsByClassName("search-result-info")[0];
  info.innerText = "The keywords are found in the following documents in "+(endTime - startTime)+"ms";
  const ul = document.getElementsByClassName("search-result-list")[0];
  ul.innerHTML = "";
  for (let index = 0; index < results.length; index++) {
    const result = results[index];
    const timestamp = parseInt(result.split("-")[0]);
    const pageIndex = parseInt(result.split("-")[1]);
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = "javascript:void();";
    link.addEventListener("click",function(){
      //DWObject.CurrentImageIndexInBuffer = pageIndex;
      window.open("document.html?timestamp="+timestamp+"&page="+pageIndex+"&query="+encodeURIComponent(query),"_blank");
    });
    link.innerText = "Document: "+getDocumentDate(timestamp)+", Page "+(pageIndex+1);
    item.append(link);
    ul.append(item);
  }
  updateStatus("");
}

async function IndexDocument(){
  updateStatus("Indexing...");
  const keys = await localForage.keys();
  //OCR results stored as timestamp+"-OCR-Data"
  const document = [];
  for (const key of keys) {
    if (key.indexOf("OCR-Data") != -1) {
      const resultsDict = await localForage.getItem(key);
      const timestamp = key.split("-")[0];
      const pageIndices = Object.keys(resultsDict);
      for (const i of pageIndices) {
        const result = resultsDict[i];
        if (result) {
          const id = timestamp+"-"+i;
          document.push({id:id,body:result.data.text});
        }
      }
    }
  }
  document.forEach(({ id, body }) => {
    if (id in Object.keys(documentIndex.register)) {
      documentIndex.remove(id);
    }
    documentIndex.add(id, body);
  });
  await SaveIndexToIndexedDB();
  updateStatus("");
}

function updateStatus(info){
  document.getElementById("status").innerText = info;
}

function getDocumentDate(timestamp){
  return new Date(parseInt(timestamp)).toLocaleString();
}

