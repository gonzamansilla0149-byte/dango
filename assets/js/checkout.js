document.addEventListener("DOMContentLoaded", () => {

  const itemsContainer = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");
  const form = document.getElementById("checkout-form");

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    itemsContainer.innerHTML = "<p>Tu carrito está vacío</p>";
    return;
  }

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;

    itemsContainer.innerHTML += `
      <div class="checkout-item">
        <span>${item.name} x${item.quantity}</span>
        <span>$${(item.price * item.quantity).toLocaleString()}</span>
      </div>
    `;
  });

  totalEl.textContent = "$" + total.toLocaleString();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const order = {
      customer: {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        city: formData.get("city"),
        postal: formData.get("postal"),
      },
      items: cart,
      total: total,
      date: new Date().toISOString()
    };

    console.log("Pedido listo para enviar:", order);

    // Próximo paso: enviar a tu API

    localStorage.removeItem("cart");
    window.location.href = "gracias.html";
  });

});
