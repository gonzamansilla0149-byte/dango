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
   CARRITO (ESTADO GLOBAL)
================================ */

// ⬇️ AHORA ES PERSISTENTE
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartBtn = document.getElementById("btn-cart");
const cartModal = document.getElementById("cart-modal");
const cartCount = document.querySelector(".cart-btn");

/* ===============================
   ABRIR / CERRAR MODAL CARRITO
================================ */

if (cartBtn && cartModal) {
  cartBtn.addEventListener("click", () => {
    renderCart();
    cartModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal || e.target.classList.contains("close-modal")) {
      cartModal.style.display = "none";
      document.body.style.overflow = "";
    }
  });
}

/* ===============================
   AGREGAR AL CARRITO
================================ */

document.querySelectorAll(".product-card button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".product-card");
    if (!card) return;

    const product = {
      name: card.querySelector("h3")?.textContent || "Producto",
      price: card.querySelector(".price")?.textContent || "$0"
    };

    cart.push(product);
    updateCartCount();
  });
});

/* ===============================
   ACTUALIZAR CONTADOR
================================ */

function updateCartCount() {
  // ⬇️ GUARDAMOS CADA CAMBIO
  localStorage.setItem("cart", JSON.stringify(cart));

  if (cartCount) {
    cartCount.textContent = `Carrito (${cart.length})`;
  }
}

/* ===============================
   RENDER CARRITO EN MODAL
================================ */

function renderCart() {
  if (!cartModal) return;

  const content = cartModal.querySelector(".modal-content");
  if (!content) return;

  let html = `<h3>Carrito</h3>`;

  if (cart.length === 0) {
    html += `<p>Tu carrito está vacío</p>`;
  } else {
    html += `<ul>`;
    cart.forEach((item, index) => {
      html += `
        <li>
          ${item.name} - ${item.price}
          <button data-index="${index}">✕</button>
        </li>
      `;
    });
    html += `</ul>`;
  }

  html += `<span class="close-modal">✕</span>`;

  content.innerHTML = html;

  content.querySelectorAll("button[data-index]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.getAttribute("data-index");
      cart.splice(index, 1);
      updateCartCount();
      renderCart();
    });
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

/* ===============================
   INIT
================================ */

// ⬇️ RESTAURA CONTADOR AL CARGAR
updateCartCount();
