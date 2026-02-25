/* ===============================
   FUNCIONES
================================ */

/* -------- CATEGORÍA DESDE LA URL -------- */
function initCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("cat");

  const categoryNames = {
    celulares: "Celulares",
    computacion: "Computación",
    herramientas: "Herramientas",
    accesorios: "Accesorios",
    ofertas: "Ofertas"
  };

  if (!category) return;

  const title = document.querySelector(".category-header h1");
  const breadcrumb = document.querySelector(".breadcrumb");

  const name = categoryNames[category] || "Productos";

  if (title) title.textContent = name;
  if (breadcrumb) breadcrumb.textContent = `Inicio / ${name}`;
}


/* -------- DROPDOWN CUENTA -------- */
function initAccountDropdown() {
  const btnLogin = document.getElementById("btn-login");
  const dropdown = document.getElementById("account-dropdown");

  if (!btnLogin || !dropdown) return;

  btnLogin.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".account-wrapper")) {
      dropdown.classList.remove("show");
    }
  });
}


/* -------- MENÚ CATEGORÍAS MOBILE -------- */
function initMobileMenu() {
  const btnCategories = document.getElementById("btn-categories");
  const categoriesDropdown = document.getElementById("categories-dropdown");

  if (!btnCategories || !categoriesDropdown) return;

  btnCategories.addEventListener("click", () => {
    categoriesDropdown.classList.toggle("show");
  });
}


/* -------- SLIDERS AUTOMÁTICOS HOME -------- */
function initAutoSliders() {
  const sliders = document.querySelectorAll(".auto-slider");

  if (!sliders.length) return;

  sliders.forEach((slider) => {
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
}



/* ===============================
   INICIALIZACIÓN GENERAL
================================ */

document.addEventListener("DOMContentLoaded", () => {
  initCategoryFromURL();
  initAccountDropdown();
  initMobileMenu();
  initAutoSliders();
});
