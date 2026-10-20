import styles from './style.module.css';
import JSZip from 'jszip';
import Dynamsoft from 'dwt';
import { WebTwain } from 'dwt/dist/types/WebTwain';

export interface Config {
  license?:string;
  container?:HTMLDivElement;
}

export enum ImageFormat {
  JPG = 0,
  PNG = 1,
  PDF = 2,
  TIFF = 3
}

export interface ConvertedFile {
  filename:string;
  blob:Blob;
}

export class ImageConverter {
  private container!:HTMLDivElement;
  private filesSelected:File[] = [];
  private DWObject!:WebTwain;
  private fileInput!:HTMLInputElement;
  private useZipCheckbox!:HTMLInputElement;
  private prompt!:HTMLDivElement;
  private files!:HTMLDivElement;
  private convertActions!:HTMLDivElement;
  private formatSelect!:HTMLSelectElement;
  private convertButton!:HTMLElement;
  private chooseFilesButton!:HTMLElement;
  constructor(config?:Config) {
    if (config) {
      if (config.container) {
        this.container = config.container;
        this.createElements();
      }
      if (config.license) {
        Dynamsoft.DWT.ProductKey = config.license;
      }
    }
    this.initDWT();
  }

  async convert(file:File,targetFormat:ImageFormat){
    let files:ConvertedFile[] = [];
    this.DWObject.RemoveAllImages();
    await this.loadImageFromFile(file);
    let fileType = 7;
    let extension = "";
    if (targetFormat === ImageFormat.JPG) {
      fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG;
      extension = ".jpg";
    }else if (targetFormat === ImageFormat.PNG) {
      fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG;
      extension = ".png";
    }else if (targetFormat === ImageFormat.PDF) {
      fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF;
      extension = ".pdf";
    }else if (targetFormat === ImageFormat.TIFF) {
      fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF;
      extension = ".tiff";
    }
    if (targetFormat > 1) {
      let blob = await this.getBlob(this.getImageIndices(),fileType);
      files.push({filename:this.getFileNameWithoutExtension(file.name)+extension,blob:blob})
    }else{
      if (this.DWObject.HowManyImagesInBuffer > 1) {
        for (let index = 0; index < this.DWObject.HowManyImagesInBuffer; index++) {
          let blob = await this.getBlob([index],fileType);
          files.push({filename:this.getFileNameWithoutExtension(file.name)+"-"+index+extension,blob:blob})
        }
      }else{
        let blob = await this.getBlob([0],fileType);
        files.push({filename:this.getFileNameWithoutExtension(file.name)+extension,blob:blob})
      }
    }
    return files;
  }

  getDWObject(){
    return this.DWObject;
  }

  createElements(){
    let pThis = this;
    this.prompt = document.createElement("div");
    this.prompt.innerText = "Please select files to convert.";
    this.prompt.className = styles.prompt;
    this.files = document.createElement("div");
    let actionsContainer = document.createElement("div");
    actionsContainer.className = styles.actions;
    let chooseFilesContainer = document.createElement("div");
    this.fileInput = document.createElement("input");
    this.fileInput.style.display = "none";
    this.fileInput.multiple = true;
    this.fileInput.accept = ".bmp,.jpeg,.jpg,.png,.pdf,.tiff,.tif,.zip";
    this.fileInput.type = "file";
    this.fileInput.addEventListener("change",async function(){
      pThis.chooseFilesButton.innerText = "Loading...";
      await pThis.appendFiles();
      pThis.listFiles();
      pThis.chooseFilesButton.innerText = "Choose Files";
    })
    this.chooseFilesButton = this.DynamsoftButton("Choose Files");
    this.chooseFilesButton.addEventListener("click",function(){
      pThis.fileInput!.click();
    });
    chooseFilesContainer.appendChild(this.fileInput);
    chooseFilesContainer.appendChild(this.chooseFilesButton);
    actionsContainer.appendChild(chooseFilesContainer);
    this.convertActions = document.createElement("div");
    this.convertActions.className = styles.convertActions;
    let formatSelector = document.createElement("label");
    formatSelector.innerText = "To:"
    this.formatSelect = document.createElement("select");
    for (const format of ["JPG","PNG","PDF","TIFF"]) {
      this.formatSelect.options.add(new Option(format,format));
    }
    formatSelector.appendChild(this.formatSelect);
    let useZip = document.createElement("label");
    useZip.innerText = "Download as Zip:"
    useZip.style.marginLeft = "10px";
    this.useZipCheckbox = document.createElement("input");
    this.useZipCheckbox.type = "checkbox";
    useZip.appendChild(this.useZipCheckbox);
    this.convertButton = this.DynamsoftButton("Convert");
    this.convertButton.style.marginLeft = "10px";
    this.convertButton.addEventListener("click",function(){
      try {
        pThis.convertAndDownload();  
      } catch (error) {
        alert(error);
      }
    })
    this.convertActions.appendChild(formatSelector);
    this.convertActions.appendChild(useZip);
    this.convertActions.appendChild(this.convertButton);
    actionsContainer.appendChild(this.convertActions);
    this.container.appendChild(this.prompt);
    this.container.appendChild(this.files);
    this.container.appendChild(actionsContainer);
  }

  initDWT(){
    Dynamsoft.DWT.AutoLoad = false;
    Dynamsoft.DWT.Containers = [];
    Dynamsoft.DWT.ResourcesPath = "https://unpkg.com/dwt@19.4.4/dist";
    Dynamsoft.DWT.UseLocalService = false;
    let pThis = this;
    Dynamsoft.DWT.CreateDWTObjectEx(
      {
        WebTwainId: 'dwtcontrol'
      },
      function(obj:WebTwain) {
        pThis.DWObject = obj;
      },
      function(err:string) {
        console.log(err);
      }
    );
  }

  DynamsoftButton(text:string){
    let anchor = document.createElement("a");
    anchor.innerText = text;
    anchor.className = styles.primaryBtn + " " + styles.textUpperCase;
    return anchor;
  }

  async appendFiles(){
    if (this.fileInput.files) {
      for (let index = 0; index < this.fileInput.files.length; index++) {
        let file = this.fileInput.files[index];
        if (file.name.endsWith(".zip")) {
          this.useZipCheckbox.checked = true;
          await this.loadImagesFromZip(file);
        }else{
          this.filesSelected.push(file);
        }
        
      }
    }
  }

  listFiles(){
    this.files.innerHTML = "";
    for (let index = 0; index < this.filesSelected.length; index++) {
      const file = this.filesSelected[index];
      let oneFile = this.fileItem(file);
      if (index != this.filesSelected.length - 1) {
        oneFile.style.marginBottom = "10px";
      }
      this.files.appendChild(oneFile);
    }
    if (this.filesSelected.length > 0) {
      this.prompt.style.display = "none";      
    }else{
      this.prompt.style.display = "";
    }
  }

  fileItem(file:File){
    let container = document.createElement("div");
    container.className = styles.oneFile;
    let title = document.createElement("div");
    title.innerText = this.useEllipsesForLongText(file.name);
    title.className = styles.title;
    let fileSize = document.createElement("div");
    fileSize.innerText = file.size/1000 + "kb";
    let deleteButton = this.DynamsoftButton("Delete");
    let pThis = this;
    deleteButton.addEventListener("click",function(){
      pThis.deleteSelected(file);
    })
    container.appendChild(title);
    container.appendChild(fileSize);
    container.appendChild(deleteButton);
    return container;
  }

  deleteSelected(file:File){
    let index = this.filesSelected.indexOf(file);
    this.filesSelected.splice(index,1);
    this.listFiles();
  }

  useEllipsesForLongText(text:string){
    if (text.length>28){
      text = text.substring(0,14) + "..." + text.substring(text.length-14,text.length);
    }
    return text;
  }

  async convertAndDownload(){
    this.convertButton.innerText = "Converting...";
    let zip:JSZip|undefined;
    if (this.useZipCheckbox.checked) {
      zip = new JSZip();
    }
    for (let index = 0; index < this.filesSelected.length; index++) {
      const file = this.filesSelected[index];
      this.DWObject.RemoveAllImages();
      await this.loadImageFromFile(file);
      await this.save(file,zip);
    }
    if (this.useZipCheckbox.checked && zip) {
      let pThis = this;
      zip.generateAsync({type:"blob"}).then(function(content) {
        pThis.downloadBlob(content,"images.zip");
      });
    }
    this.convertButton.innerText = "Convert";
  }

  async loadImageFromFile(file:File){
    return new Promise<void>((resolve, reject) => {
      this.DWObject.LoadImageFromBinary(file,
        function(){
          resolve();
        },
        function(_errorCode: number, errorString: string){
          reject(errorString);
        }
      )
    })
  }

  async save(file:File,zip:JSZip|undefined){
    if (this.useZipCheckbox.checked === false) {
      await this.saveImages(file);
    }else{
      if (zip) {
        await this.appendImagesToZip(file,zip);
      }
    }
  }

  async saveImages(file:File){
    let selectedFormatIndex = this.formatSelect.selectedIndex;
    //"JPG","PNG","PDF","TIFF"
    let fileType = 7;
    let extension = "";
    if (selectedFormatIndex === 0) {
      fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG;
      extension = ".jpg";
    }else if (selectedFormatIndex === 1) {
      fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG;
      extension = ".png";
    }else if (selectedFormatIndex === 2) {
      fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF;
      extension = ".pdf";
    }else if (selectedFormatIndex === 3) {
      fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF;
      extension = ".tiff";
    }
    if (selectedFormatIndex > 1) {
      let blob = await this.getBlob(this.getImageIndices(),fileType);
      this.downloadBlob(blob,this.getFileNameWithoutExtension(file.name)+extension);
    }else{
      if (this.DWObject.HowManyImagesInBuffer > 1) {
        for (let index = 0; index < this.DWObject.HowManyImagesInBuffer; index++) {
          let blob = await this.getBlob([index],fileType);
          this.downloadBlob(blob,this.getFileNameWithoutExtension(file.name)+"-"+index+extension);
        }
      }else{
        let blob = await this.getBlob([0],fileType);
        this.downloadBlob(blob,this.getFileNameWithoutExtension(file.name)+extension);
      }
    }
  }

  async appendImagesToZip(file:File,zip:JSZip){
    let selectedFormatIndex = this.formatSelect.selectedIndex;
    //"JPG","PNG","PDF","TIFF"
    let fileType = 7;
    let extension = "";
    if (selectedFormatIndex === 0) {
      fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG;
      extension = ".jpg";
    }else if (selectedFormatIndex === 1) {
      fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG;
      extension = ".png";
    }else if (selectedFormatIndex === 2) {
      fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF;
      extension = ".pdf";
    }else if (selectedFormatIndex === 3) {
      fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF;
      extension = ".tiff";
    }
    if (selectedFormatIndex > 1) {
      let blob = await this.getBlob(this.getImageIndices(),fileType);
      zip.file(this.getFileNameWithoutExtension(file.name)+extension, blob);
    }else{
      if (this.DWObject.HowManyImagesInBuffer > 1) {
        for (let index = 0; index < this.DWObject.HowManyImagesInBuffer; index++) {
          let blob = await this.getBlob([index],fileType);
          zip.file(this.getFileNameWithoutExtension(file.name)+"-"+index+extension, blob);
        }
      }else{
        let blob = await this.getBlob([0],fileType);
        zip.file(this.getFileNameWithoutExtension(file.name)+extension, blob);
      }
    }
  }

  getImageIndices(){
    let indices = [];
    for (let index = 0; index < this.DWObject.HowManyImagesInBuffer; index++) {
      indices.push(index);
    }
    return indices;
  }

  downloadBlob(content:Blob,filename:string){
    const link = document.createElement('a')
    link.href = URL.createObjectURL(content);
    link.download = filename;
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  getBlob(indices:number[],type:number){
    return new Promise<Blob>(async (resolve, reject) => {
      if (type == Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG && indices.length === 1){
        if (this.DWObject.GetImageBitDepth(indices[0]) == 1) {
          //If so, convert the image to Gray
          await this.convertToGrayScale(indices[0]);
        }
      }
      this.DWObject.ConvertToBlob(indices,type,
        function(blob:Blob){
          resolve(blob);
        },
        function(_errorCode: number, errorString: string){
          reject(errorString);
        }
      )  
    })
  }
  
  convertToGrayScale(index:number){
    return new Promise<void>((resolve, reject) => {
      this.DWObject.ConvertToGrayScale(
        index,
        function(){
          resolve();
        },
        function (_errorCode:number,errorMessage:string){
          reject(errorMessage);
        }
      );
    })
  }

  /*
  * eg. filename.jpg -> filename
  */
  getFileNameWithoutExtension(filename:string){
    if (filename.lastIndexOf(".") != -1) {
      return filename.substring(0,filename.lastIndexOf("."));
    }else{
      return filename;
    }
  }

  async loadImagesFromZip(zipFile:File){
    const buffer = await zipFile.arrayBuffer();
    let zip = new JSZip();
    await zip.loadAsync(buffer);
    const files = zip.files;
    const filenames = Object.keys(files);
    for (let index = 0; index < filenames.length; index++) {
      const filename = filenames[index];
      const lowerCase = filename.toLowerCase();
      const file = files[filename];
      if (file.dir === false) {
        if (lowerCase.endsWith(".jpg") || lowerCase.endsWith(".jpeg") || lowerCase.endsWith(".png") || lowerCase.endsWith(".bmp") || lowerCase.endsWith(".pdf") || lowerCase.endsWith(".tif") || lowerCase.endsWith(".tiff")) {
          let blob:Blob = await file.async("blob");
          let imgFile = new File([blob],filename);
          this.filesSelected.push(imgFile);
        }
      }
    }
  }
}