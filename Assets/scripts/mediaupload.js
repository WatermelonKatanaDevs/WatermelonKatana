(function(){
  if (document.getElementById("upload-container")) return;

  var style = document.createElement('style');
  style.id = 'media-upload-style';
  style.textContent = `
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
`;
  (document.head || document.documentElement).appendChild(style);

  var container = document.createElement('div');
  container.id = 'upload-container';

  var link = document.createElement('input');
  link.id = 'link-insert';
  link.type = 'text';

  var file = document.createElement('input');
  file.id = 'file-upload';
  file.type = 'file';
  file.accept = 'image/*';

  var preview = document.createElement('img');
  preview.id = 'upload-preview';

  var submit = document.createElement('button');
  submit.id = 'file-upload-submit';
  submit.textContent = 'Upload';

  var cancel = document.createElement('button');
  cancel.id = 'file-upload-cancel';
  cancel.textContent = 'Cancel';

  container.appendChild(link);
  container.appendChild(document.createElement('br'));
  container.appendChild(file);
  container.appendChild(document.createElement('br'));
  container.appendChild(preview);
  container.appendChild(submit);
  container.appendChild(cancel);
  document.body.appendChild(container);

  link.addEventListener('change', setPreviewLink);
  file.addEventListener('change', setPreview);
  preview.addEventListener('error', function(){ cancelImagePreview(preview); });
  submit.addEventListener('click', uploadMedia);
  cancel.addEventListener('click', function(){ fileUploaded(null); });
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
  params.set("name",file.name.replace(/\.[^.]+$/,"") );
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
    fileUploaded(null);
  }
}
async function setPreview() {
  var link = document.querySelector('#link-insert');
  var elem = document.querySelector('#file-upload');
  var img = document.querySelector('#upload-preview');
  var file = elem.files[0];
  if (!file) return;
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
  if (typeof window.onfileupload === 'function') {
    var resolve = window.onfileupload;
    window.onfileupload = null;
    resolve(url);
  }
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
