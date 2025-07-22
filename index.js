
const modal = document.getElementById("uploadModal");
const fetchmodal=document.getElementById("fetchmodal");
const fileInput = document.getElementById("fileInput");
const fileNameText = document.getElementById("selectedFileName");
const passwordDiv = document.getElementById("password");
const uploadForm = document.getElementById("uploadForm");
document.getElementById("uploadbutton").addEventListener("click", uploadfiles);


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
function uploadfiles(event) {

  if (event) event.preventDefault(); 
  const file = fileInput.files[0];

  if (!file || file.size === 0) {
    Swal.fire({
      title: 'No File Selected',
      text: 'Please choose a file before uploading.',
      icon: 'warning',
      confirmButtonColor: 'orange'
    }).then((result) => {
      if (result.isConfirmed) {
        closeModal();
      }
    });
    return;
  }

  // Ask the user for the expiry time using SweetAlert2.
  Swal.fire({
    title: 'Set Expiry Time',
    text: 'Enter the number of minutes your file should be available for:',
    input: 'number',
    inputLabel: 'Expiry Time (in minutes)',
    inputAttributes: {
      min: 1,
      step: 1
    },
    inputPlaceholder: 'e.g., 60',
    showCancelButton: true,
    confirmButtonText: 'Submit',
    cancelButtonText: 'Cancel',
    allowOutsideClick: false,
    preConfirm: (value) => {
      if (!value || value <= 0) {
        Swal.showValidationMessage('Please enter a valid positive number');
      }
      return value;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const expiry = result.value;

      
      Swal.fire({
        title: 'Uploading...',
        text: 'Please wait while your file is being uploaded.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Create form data with file, email and expiry
      const formData = new FormData();
      formData.append("file", file);
      formData.append("expiryMinutes", expiry);

      fetch('https://quickshare-3m6q.onrender.com/upload', {
        method: 'POST',
        body: formData
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          } else {
            throw new Error('Upload failed');
          }
        })
        .then((data) => {
          Swal.fire({
            title: "File Uploaded",
            text: `Your Password is ${data.password}`,
            icon: 'success',
            confirmButtonText: 'copy password',
            confirmButtonColor: 'orange'
          }).then(result=>{
            if(result.isConfirmed){
            navigator.clipboard.writeText(data.password);
            closeModal();
            }
          })
        })
        .catch((err) => {
          Swal.fire({
            title: 'Upload Failed',
            text: err.message || 'Something went wrong',
            icon: 'error',
            confirmButtonColor: 'orange'
          }).then(() => {
            closeModal();
          });
        });
    }
  });
}


  window.addEventListener("beforeunload", () => {
    alert("Something is reloading the page");
  });
function getfiles(){
  const key=document.getElementById('fetchpassword').value;
  Swal.fire({
    title: 'Fetching Your files',
    text: 'Please wait while your file is being fetched.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
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
    Swal.close();
    window.location.href = `https://quickshare-3m6q.onrender.com/uploads/${data.filename}`;
  })
  
}
