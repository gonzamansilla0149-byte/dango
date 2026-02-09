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
    if (
      e.target === loginModal ||
      e.target.classList.contains("close-modal")
    ) {
      loginModal.style.display = "none";
      document.body.style.overflow = "";
    }
  });
}

/* ===============================
   MODAL CARRITO
================================ */

const cartBtn = document.getElementById("btn-cart");
const cartModal = document.getElementById("cart-modal");

if (cartBtn && cartModal) {
  cartBtn.addEventListener("click", () => {
    cartModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  cartModal.addEventListener("click", (e) => {
    if (
      e.target === cartModal ||
      e.target.classList.contains("close-modal")
    ) {
      cartModal.style.display = "none";
      document.body.style.overflow = "";
    }
  });
}
