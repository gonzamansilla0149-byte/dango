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

// ==========================
// INICIAR
// ==========================

document.addEventListener("DOMContentLoaded", updateCartCount);
