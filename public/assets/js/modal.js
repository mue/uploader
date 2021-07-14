const modal = document.getElementById('photomodal');
const closemodal = document.getElementById('closemodal');
const modalphoto = document.getElementById('modalphoto');

photo.onclick = () => {
  modal.style.display = 'block';
  modalphoto.src = photo.src;
}

closemodal.onclick = () => {
  modal.style.display = 'none';
}

window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}
