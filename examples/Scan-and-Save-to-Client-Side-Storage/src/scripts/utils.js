export function arrayBufferToBlob(buffer,type){
  return new Blob([buffer],{type:type});
}

export function blobToArrayBuffer(blob){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader;
    reader.addEventListener("loadend",function(){
      resolve(reader.result);
    });
    reader.addEventListener("error",reject);
    reader.readAsArrayBuffer(blob);
  });
}

export function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]); return null;
}

export function moveItemUp(arr, index) {
  if (index <= 0 || index > arr.length - 1) { //out of bounds
    return arr;
  }else{
    if (arr instanceof HTMLElement) {
      const node1 = arr.children.item(index - 1);
      const node2 = arr.children.item(index);
      arr.insertBefore(node2,node1);
    }else if (arr instanceof Array) {
      const item = arr.splice(index,1)[0]; //delete the item
      arr.splice(index - 1,0,item); //add the item
    }
    return arr;
  }
}

export function moveItemDown(arr, index) {
  if (index < 0 || index + 1 > arr.length - 1) { //out of bounds
    return arr;
  }else{
    if (arr instanceof HTMLElement) {
      const node1 = arr.children.item(index);
      const node2 = arr.children.item(index + 1);
      arr.insertBefore(node2,node1);
    }else if (arr instanceof Array) {
      const item = arr.splice(index,1)[0]; //delete the item
      arr.splice(index + 1,0,item); //add the item
    }
    return arr;
  }
}

export function removeItem(arr, index) {
  if (index < 0 || index > arr.length - 1) { //out of bounds
    return arr;
  }else{
    if (arr instanceof HTMLElement) {
      arr.removeChild(arr.children.item(index));
    }else if (arr instanceof Array) {
      arr.splice(index,1); //delete the item
    }
    return arr;
  }
}

export function rotateImage(imgElement,rotationDegree){
  return new Promise(function (resolve, reject) {
    try {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");	
      // Assign width and height.
      if (rotationDegree === -180) {
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;
      }else{
        canvas.width = imgElement.naturalHeight;
        canvas.height = imgElement.naturalWidth;
      }
      ctx.translate(canvas.width / 2,canvas.height / 2);
      // Rotate the image and draw it on the canvas. 
      // (I am not showing the canvas on the webpage.
      ctx.rotate(rotationDegree * Math.PI / 180);
      ctx.drawImage(imgElement, -imgElement.naturalWidth / 2, -imgElement.naturalHeight / 2);
      canvas.toBlob(function(blob){
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
}
