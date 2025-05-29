// Show footer only when user reaches bottom
window.addEventListener("scroll", function () {
  const footer = document.querySelector("footer");
  const scrollPosition = window.innerHeight + window.scrollY;
  const bottomOffset = document.body.offsetHeight - 20;

  if (scrollPosition >= bottomOffset) {
    footer.style.display = "block";
  } else {
    footer.style.display = "none";
  }
});
