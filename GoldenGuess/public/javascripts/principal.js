/*=============== CARD POPUP JS ===============*/
const modal = document.querySelectorAll('.modal'),
      cardBtn = document.querySelectorAll('.btn'),
      modalClose = document.querySelectorAll('.modal__close'),
      modalCard = document.querySelectorAll('.modal__card')

let activeModal = (buttonClick) =>{
   modal[buttonClick].classList.add('active-modal')
}
console.log(modal[0])
/* Show modal */
cardBtn.forEach((cardBtn, i) =>{
   cardBtn.addEventListener('click', () =>{
      activeModal(i)
   })
})

/* Hide modal */
modalClose.forEach((modalClose) =>{
   modalClose.addEventListener('click', () => {
       modal.forEach((modalRemove) => {
           modalRemove.classList.remove('active-modal')
       })
   })
})

/* Hide modal on background click */
modal.forEach((modal) =>{
   modal.addEventListener('click', () =>{
      modal.classList.remove('active-modal')
   })
})

/* Don't hide modal on card click (by event propagation) */
modalCard.forEach((modalCard) =>{
   modalCard.addEventListener('click', (e) =>{
      e.stopPropagation()
   })
})