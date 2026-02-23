/* ===============================
   CATEGORÍA DESDE LA URL
================================ */

const params = new URLSearchParams(window.location.search);
const category = params.get("cat");

const categoryNames = {
  celulares: "Celulares",
  computacion: "Computación",
  herramientas: "Herramientas",
  accesorios: "Accesorios",
  ofertas: "Ofertas"
};

if (category) {
  const title = document.querySelector(".category-header h1");
  const breadcrumb = document.querySelector(".breadcrumb");

  const name = categoryNames[category] || "Productos";

  if (title) title.textContent = name;
  if (breadcrumb) breadcrumb.textContent = `Inicio / ${name}`;
}

/* ===============================
   MODAL LOGIN
================================ */

const loginBtn = document.getElementById("btn-login");
const loginModal = document.getElementById("login-modal");

if (loginBtn && loginModal) {
  loginBtn.addEventListener("click", () => {
    loginModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal || e.target.classList.contains("close-modal")) {
      loginModal.style.display = "none";
      document.body.style.overflow = "";
    }
  });
}

/* ===============================
   MENÚ CATEGORÍAS MOBILE
================================ */

const btnCategories = document.getElementById("btn-categories");
const categoriesDropdown = document.getElementById("categories-dropdown");

if (btnCategories && categoriesDropdown) {
  btnCategories.addEventListener("click", () => {
    categoriesDropdown.classList.toggle("show");
  });
}

/* ===============================
   SLIDERS AUTOMÁTICOS HOME
================================ */

document.querySelectorAll(".auto-slider").forEach((slider) => {
  let scrollAmount = 0;
  const step = 240;

  setInterval(() => {
    if (slider.scrollWidth <= slider.clientWidth) return;

    scrollAmount += step;

    if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
      scrollAmount = 0;
    }

    slider.scrollTo({
      left: scrollAmount,
      behavior: "smooth"
    });
  }, 3000);
});


