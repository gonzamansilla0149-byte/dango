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
  const openLogin = document.getElementById("open-login");
  const openRegister = document.getElementById("open-register");
  const loginModal = document.getElementById("login-modal");
  const closeModal = document.querySelector(".close-modal");

  if (!btnLogin || !dropdown) return;

  // Mostrar / ocultar dropdown
  btnLogin.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  // Cerrar dropdown al hacer click afuera
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".account-wrapper")) {
      dropdown.classList.remove("show");
    }
  });

  // Abrir modal login
  if (openLogin && loginModal) {
    openLogin.addEventListener("click", () => {
      dropdown.classList.remove("show");
      loginModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  }

  // Abrir modal registro (usa mismo modal por ahora)
  if (openRegister && loginModal) {
    openRegister.addEventListener("click", () => {
      dropdown.classList.remove("show");
      loginModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  }

  // Cerrar modal con la X
  if (closeModal && loginModal) {
    closeModal.addEventListener("click", () => {
      loginModal.style.display = "none";
      document.body.style.overflow = "";
    });
  }

  // Cerrar modal haciendo click fuera del contenido
  if (loginModal) {
    loginModal.addEventListener("click", (e) => {
      if (e.target === loginModal) {
        loginModal.style.display = "none";
        document.body.style.overflow = "";
      }
    });
  }
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
