// ==========================
// OBTENER CARRITO
// ==========================

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

// ==========================
// GUARDAR CARRITO
// ==========================

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// ==========================
// AGREGAR PRODUCTO
// ==========================

function addToCart(product) {

  let cart = getCart();

  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: 1
    });
  }

  saveCart(cart);
}

// ==========================
// ACTUALIZAR CONTADOR HEADER
// ==========================

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartBtn = document.getElementById("btn-cart");
  if (cartBtn) {
    cartBtn.textContent = `Carrito (${totalItems})`;
  }
}

function renderCartPage() {

  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = "<p>Tu carrito está vacío</p>";
    totalEl.textContent = "$0";
    return;
  }

  let total = 0;

  container.innerHTML = "";

  cart.forEach(item => {

    total += item.price * item.quantity;

    container.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}" />
        <div class="cart-info">
          <h3>${item.name}</h3>
          <p>$${item.price.toLocaleString()}</p>
        </div>
        <div class="cart-quantity">
          <button onclick="decreaseQty(${item.id})">-</button>
          <span>${item.quantity}</span>
          <button onclick="increaseQty(${item.id})">+</button>
          <button onclick="removeFromCart(${item.id})">✕</button>
        </div>
      </div>
    `;
  });

  totalEl.textContent = "$" + total.toLocaleString();
}

// ==========================
function increaseQty(id) {
  let cart = getCart();
  const item = cart.find(p => p.id === id);
  if (item) item.quantity++;
  saveCart(cart);
  renderCartPage();
}

function decreaseQty(id) {
  let cart = getCart();
  const item = cart.find(p => p.id === id);
  if (item && item.quantity > 1) item.quantity--;
  saveCart(cart);
  renderCartPage();
}

function removeFromCart(id) {
  let cart = getCart().filter(p => p.id !== id);
  saveCart(cart);
  renderCartPage();
}

const checkoutBtn = document.getElementById("btn-checkout");

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    window.location.href = "checkout.html";
  });
}
// INICIAR
// ==========================
document.addEventListener("DOMContentLoaded", renderCartPage);
document.addEventListener("DOMContentLoaded", updateCartCount);
