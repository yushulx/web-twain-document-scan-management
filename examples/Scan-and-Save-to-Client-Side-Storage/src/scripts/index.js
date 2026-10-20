import localforage  from 'localforage';
import '../styles/index.scss';

let metadataStore = localforage.createInstance({
  name: "metadata"
});

let imagesStore = localforage.createInstance({
  name: "images"
});

window.onload = function(){
  loadDocumentsList();
  registerEvents();
};

async function loadDocumentsList(){
  let ul = document.getElementById("document-list");
  let keys = await metadataStore.keys();
  if (keys) {
    for (let index = 0; index < keys.length; index++) {
      const timestamp = keys[index];
      let listItem = document.createElement("li");
      let link = document.createElement("a");
      link.href = "document-scanner.html?ID="+timestamp;
      link.target = "_blank";
      link.innerText = new Date(parseInt(timestamp)).toLocaleString();
      listItem.appendChild(link);
      let btn = document.createElement("button");
      btn.innerText = "Delete";
      btn.addEventListener("click",async function(){
        await deleteDocument(timestamp);
        listItem.remove();
      });
      btn.style.marginLeft = "2em";
      listItem.append(btn);
      ul.appendChild(listItem);
    }
  }
}

async function deleteDocument(ID){
  const images = await metadataStore.getItem(ID);
  for (let index = 0; index < images.length; index++) {
    const imageID = images[index];
    await imagesStore.removeItem(imageID);
  }
  await metadataStore.removeItem(ID);
}

function registerEvents(){
  document.getElementById("new-document-button").addEventListener("click",async function(){
    newDocument();
  });
}

function newDocument(){
  window.open("document-scanner.html?ID="+Date.now(),"_blank");
}
