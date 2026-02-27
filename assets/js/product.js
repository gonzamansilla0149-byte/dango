document.addEventListener("DOMContentLoaded", async () => {

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  const container = document.querySelector(".product-container");
  if (!container) return;

  if (!id || isNaN(id)) {
    container.innerHTML = "<h2>ID inválido o no especificado</h2>";
    return;
  }

  try {

    // ===============================
    // TRAER PRODUCTO POR ID
    // ===============================

const response = await fetch(
  `/api/products/${id}`
);

    if (!response.ok) {
      throw new Error("Error al obtener producto");
    }

    const product = await response.json();
    document.querySelector(".stock-units").innerText = "999";

    if (!product || !product.id) {
      container.innerHTML = "<h2>Producto no encontrado</h2>";
      return;
    }

    console.log("Producto cargado:", product);

    // ===============================
    // ELEMENTOS
    // ===============================

    const title = document.querySelector(".product-title");
    const brand = document.querySelector(".product-brand");
    const price = document.querySelector(".product-price");
    const description = document.querySelector(".product-description");
    const mainImage = document.querySelector(".main-image");
    const breadcrumb = document.querySelector(".breadcrumb-product");
    const stockUnits = document.querySelector(".stock-units");
    const soldUnits = document.querySelector(".sold-units");
    const buyBtn = document.getElementById("buy-now-btn");
    const addBtn = document.querySelector(".add-to-cart-btn");

    // ===============================
    // RENDER DATOS
    // ===============================

    if (title) title.textContent = product.name;
    if (brand) brand.textContent = product.brand_name || "";
    if (price) price.textContent = `$${Number(product.price).toLocaleString()}`;
    if (description) description.textContent = product.description || "";
    if (breadcrumb) breadcrumb.textContent = product.name;

// ===============================
// STOCK
// ===============================

const stockValue = Number(product.stock);

if (stockUnits) {

  if (!product.stock && product.stock !== 0) {
    stockUnits.textContent = "No informado";
  } 
  else if (stockValue <= 0) {
    stockUnits.textContent = "Sin stock";
    stockUnits.style.color = "red";

    if (buyBtn) buyBtn.disabled = true;
    if (addBtn) addBtn.disabled = true;
  } 
  else {
    stockUnits.textContent = stockValue;

    if (stockValue <= 5) {
      stockUnits.style.color = "orange";
    }
  }

}

// ===============================
// IMAGEN
// ===============================
if (mainImage && product.media && product.media.length > 0) {

  const firstMedia = product.media[0];

  if (firstMedia.url) {

    const image = optimizeImage(firstMedia.url, 1000);

    mainImage.style.backgroundImage = `url("${image}")`;
    mainImage.style.backgroundSize = "cover";
    mainImage.style.backgroundPosition = "center";
    mainImage.style.backgroundRepeat = "no-repeat";
  }
}
    // ===============================
    // AGREGAR AL CARRITO
    // ===============================

    const qtyInput = document.querySelector(".quantity-selector input");

    if (addBtn) {
      addBtn.addEventListener("click", () => {

        const quantity = Number(qtyInput?.value) || 1;

        if (typeof addToCart === "function") {
          for (let i = 0; i < quantity; i++) {
            addToCart(product);
          }

          const drawer = document.getElementById("cart-drawer");
          if (drawer) drawer.classList.add("active");
        }
      });
    }

    // ===============================
    // QUICK CHECKOUT
    // ===============================

    const quickCheckout = document.getElementById("quick-checkout");
    const qcInputs = document.querySelectorAll(".qc-input");

    let checkoutOpen = false;

    if (buyBtn && quickCheckout) {

      buyBtn.addEventListener("click", () => {

        if (!checkoutOpen) {
          quickCheckout.classList.add("active");
          checkoutOpen = true;
          buyBtn.textContent = "Continuar";
          return;
        }

        let allFilled = true;

        qcInputs.forEach(input => {
          if (!input.value.trim()) {
            allFilled = false;
            input.style.borderColor = "red";
          } else {
            input.style.borderColor = "#ddd";
          }
        });

        if (!allFilled) return;

        alert("Datos completos. Proceder al pago.");
      });
    }

  } catch (error) {
    console.error("Error cargando producto:", error);
    container.innerHTML = "<h2>Error cargando producto</h2>";
  }

});

function optimizeImage(url, width = 1000) {

  if (!url) return "";

  if (url.startsWith("http")) {
    const parsed = new URL(url);
    url = parsed.pathname;
  }

  url = url.replace(/^\/+/, "");

  if (!url.startsWith("media/")) {
    url = "media/" + url;
  }

  return `/cdn-cgi/image/format=auto,quality=85,width=${width}/${url}`;
}
