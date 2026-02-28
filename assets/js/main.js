/* ===============================
   FUNCIONES
================================ */

/* -------- CATEGORÍA DESDE LA URL -------- */
function initCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("cat");

  if (!category) return;

  const title = document.querySelector(".category-header h1");
  const breadcrumb = document.querySelector(".breadcrumb");

  if (title) title.textContent = category;
  if (breadcrumb) breadcrumb.textContent = `Inicio / ${category}`;
}
/* -------- DROPDOWN CUENTA -------- */
function initAccountDropdown() {

  const btnLogin = document.getElementById("btn-login");
  const dropdown = document.getElementById("account-dropdown");
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");
  const logoutBtn = document.getElementById("logout-btn");

  if (!btnLogin || !dropdown) return;

  const user = JSON.parse(localStorage.getItem("user"));

  // Mostrar nombre si está logueado
  if (user) {
    btnLogin.textContent = user.name.split(" ")[0];

    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
  }

  // Toggle dropdown
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

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
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

/* -------- BUSCADOR GLOBAL -------- */
function initGlobalSearch() {

  const input = document.getElementById("global-search");
  const resultsBox = document.getElementById("search-results");

  if (!input || !resultsBox) return;

  let debounceTimer;

  input.addEventListener("input", () => {

    clearTimeout(debounceTimer);

    const query = input.value.trim();

    if (query.length < 2) {
      resultsBox.classList.remove("active");
      return;
    }

    debounceTimer = setTimeout(async () => {

      try {

        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const products = await res.json();

        renderResults(query, products);

      } catch (err) {
        console.error(err);
      }

    }, 300);

  });

  input.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

      const value = input.value.trim();
      if (!value) return;

      window.location.href =
        `categoria.html?search=${encodeURIComponent(value)}`;

    }

  });

  function renderResults(query, products) {

    resultsBox.innerHTML = "";

    if (!products.length) {
      resultsBox.innerHTML =
        `<div class="search-empty">No se encontraron resultados</div>`;
      resultsBox.classList.add("active");
      return;
    }

    resultsBox.innerHTML +=
      `<div class="search-section-title">Productos</div>`;

    products.slice(0, 6).forEach(p => {

      resultsBox.innerHTML += `
        <div class="search-item"
             data-type="product"
             data-id="${p.id}">
          <span>${p.name}</span>
          <small>$${Number(p.price).toLocaleString()}</small>
        </div>
      `;

    });

    resultsBox.classList.add("active");
  }

  resultsBox.addEventListener("click", (e) => {

    const item = e.target.closest(".search-item");
    if (!item) return;

    window.location.href =
      `producto.html?id=${item.dataset.id}`;

  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-bar")) {
      resultsBox.classList.remove("active");
    }
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
  initDynamicCategories();
  initGlobalSearch(); // 🔥 ESTA LÍNEA
});

/* -------- MENÚ DINÁMICO DESDE API -------- */
async function initDynamicCategories() {

  const navContainer = document.getElementById("nav-links");
  const mobileContainer = document.getElementById("categories-dropdown");

  if (!navContainer) return;

  try {
    const res = await fetch("/api/categories");
    const categories = await res.json();

    function slugify(text) {
      return (text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-");
    }

    navContainer.innerHTML = "";
    navContainer.innerHTML += `<a href="index.html">Inicio</a>`;

    if (mobileContainer) {
      mobileContainer.innerHTML = "";
      mobileContainer.innerHTML += `<a href="index.html">Inicio</a>`;
    }

    categories.forEach(cat => {
      const slug = slugify(cat.name);

      const link = `
        <a href="categoria.html?cat=${slug}">
          ${cat.name}
        </a>
      `;

      navContainer.innerHTML += link;

      if (mobileContainer) {
        mobileContainer.innerHTML += link;
      }
    });

  } catch (err) {
    console.error("Error cargando categorías dinámicas:", err);
  }
}
