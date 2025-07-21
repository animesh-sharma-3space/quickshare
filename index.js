
const modal = document.getElementById("uploadModal");
const fetchmodal=document.getElementById("fetchmodal");
const fileInput = document.getElementById("fileInput");
const fileNameText = document.getElementById("selectedFileName");
const passwordDiv = document.getElementById("password");
const uploadForm = document.getElementById("uploadForm");
document.getElementById("uploadbutton").addEventListener("click", uploadfiles);
const email = document.getElementById("senderId").value;

function openModal() {
  modal.style.display = "flex";
}
function openfetchmodal(){
  fetchmodal.style.display = "flex";
}
function closeModal() {
  modal.style.display = "none";
  passwordDiv.innerText = "";
  fileNameText.innerText = "No file selected";
  uploadForm.reset();
}
function fetchcloseModal() {
 fetchmodal.style.display='none';
}
fileInput.addEventListener("change",()=>{
    const file=fileInput.files[0];
    if(file){
        fileNameText.innerText= `📄 ${file.name} selected`;
    }
});
function uploadfiles(event){
  const email = document.getElementById("senderId").value;
  if (event) event.preventDefault(); 
    const file = fileInput.files[0];
    if (!file || file.size==0) {
      Swal.fire({
        title: 'No File Selected',
        text: 'Please choose a file before uploading.',
        icon: 'warning',
        confirmButtonColor: 'orange'
      }).then((result)=>{
        if(result.isConfirmed){
          closeModal();
        }
      });
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email); 
  
    fetch('https://quickshare-3m6q.onrender.com/upload', {
      method: 'POST',
      body: formData
    })
      .then((res) => {
        console.log("Got response:", res);
        if (res.status === 200) {
          return res.json(); // Parse response body
        } 
      })
      .then((data) => {
        Swal.fire({
          title: 'Uploaded',
          text: `Password sent to ${email}`,
          icon: 'success'
        });
      })
      .catch((err) => {
        Swal.fire({
          title: 'Upload Failed',
          text: err.message || 'Something went wrong',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: 'orange'
        }).then((result) => {
          if (result.isConfirmed) {
            closeModal();
          }
        });
      });
    
  }
  window.addEventListener("beforeunload", () => {
    alert("Something is reloading the page");
  });
function getfiles(){
  const key=document.getElementById('fetchpassword').value;
  fetch('https://quickshare-3m6q.onrender.com/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password:key})
  })
  .then((res)=>{
    if(res.status==200){
      return res.json();
    }
    if(res.status==404){
      Swal.fire({
        title: 'Wrong Password',
        text: "Please Enter The correct password",
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'orange'
      }).then((result) => {
        if (result.isConfirmed) {
          fetchcloseModal();
        }
      });
    }
  })
  .then((data) => {
    window.location.href = `https://quickshare-3m6q.onrender.com/uploads/${data.filename}`;
  })
  
}
