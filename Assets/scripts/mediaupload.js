(function(){
  document.body.innerHTML += `
<style>

#upload-container {
  color: #fff;
  text-decoration: none;
  background-color: #333;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  align-items: center;
  justify-content: center;
  overflow: show;
  padding: 5px;
  position: fixed;
  width: 72vmin;
  top: calc(50% + 1.75em);
  left: 50%;
  transform: translate(-50%, -50%);
  display: none;
  z-index: 1000;
}

#link-insert {
  margin: 0px 0px 5px 0px;
  width: calc(72vmin - 10px);
}

#file-upload {
  margin: 0px 0px 5px 0px;
  width: calc(72vmin - 10px);
}

#upload-preview {
  max-width: 72vmin;
  max-height: 72vmin;
}

</style>
<div id="upload-container">
  <input id="link-insert" type="text" onchange="setPreviewLink()"><br>
  <input id="file-upload" type="file" accept="image/*" onchange="setPreview()"><br>
  <img id="upload-preview" onerror="cancelImagePreview(this);">
  <button id="file-upload-submit" onclick="uploadMedia()">Upload</button>
  <button id="file-upload-cancel" onclick="fileUploaded(null)">Cancel</button>
</div>`;
})();

function getFileUpload(url) {
  var container = document.querySelector("#upload-container");
  container.style.display = "block";
  var link = document.querySelector('#link-insert');
  link.value = url||"";
  if (url) setPreviewLink();
  else cancelImagePreview(document.querySelector('#upload-preview'));
  return new Promise((resolve)=>{
    window.onfileupload = resolve;
  });
}
async function uploadMedia() {
  var elem = document.querySelector('#file-upload');
  var link = document.querySelector('#link-insert');
  if (link.value || !elem.value) return fileUploaded(link.value);
  var file = elem.files[0];
  var buf = await file.arrayBuffer();
  var b64 = _arrayBufferToBase64(buf);
  var params = new URLSearchParams();
  params.set("image",b64);
  params.set("name",file.name.replace(/\.[^.]+$/,""));
  try {
    var res = await fetch("/api/media/upload",{
      method: 'POST',
      body: params
    });
    var data = await res.json();
    if (res.status > 206) throw data;
    fileUploaded(data.media.url);
  } catch (error) {
    alert(JSON.stringify(error));
    console.log(error);
    fileUploadCancel();
  }
}
async function setPreview() {
  var link = document.querySelector('#link-insert');
  var elem = document.querySelector('#file-upload');
  var img = document.querySelector('#upload-preview');
  
  var file = elem.files[0];
  var buf = await file.arrayBuffer();

  var b64 = _arrayBufferToBase64(buf);
  var url = "data:"+file.type+";base64,"+b64;
  img.src = url;
  img.style.display = "block";
  img.style.margin = "0px 0px 5px 0px";
  link.value = "";
}
async function setPreviewLink() {
  var link = document.querySelector('#link-insert');
  var elem = document.querySelector('#file-upload');
  var img = document.querySelector('#upload-preview');
  img.src = link.value;
  img.style.display = "block";
  img.style.margin = "0px 0px 5px 0px";
  elem.value = "";
}
function cancelImagePreview(img) {
  img.src = "";
  img.style.display = "none";
  img.style.margin = "0px 0px 0px 0px";
}
function fileUploaded(url) {
  var container = document.querySelector("#upload-container");
  var img = document.querySelector('#upload-preview');
  var elem = document.querySelector('#file-upload');
  container.style.display = "none";
  cancelImagePreview(img);
  elem.value = "";
  window.onfileupload(url);
}
function _arrayBufferToBase64( buffer ) {
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode( bytes[ i ] );
  }
  return window.btoa( binary );
}
