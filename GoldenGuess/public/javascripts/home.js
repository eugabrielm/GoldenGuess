const popup = document.getElementById("popup");
const closeBtn = document.querySelector(".popup-close");
const popupTriggers = document.querySelectorAll(".popup-trigger");

popupTriggers.forEach(img => {
  img.addEventListener("click", function() {
    popup.style.display = "flex"; 
  });
});

closeBtn.addEventListener("click", function() {
  popup.style.display = "none"; 
});

window.addEventListener("click", function(event) {
  if (event.target === popup) {
    popup.style.display = "none"; 
  }
});
