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
// IMÁGENES MULTIPLES
// ===============================

const thumbnailContainer = document.querySelector(".thumbnail-list");

// limpiar
if (mainImage) {
  mainImage.innerHTML = "";
}

if (thumbnailContainer) {
  thumbnailContainer.innerHTML = "";
}

const validMedia = (product.media || []).filter(m => m.url);

if (mainImage && validMedia.length > 0) {

  const firstUrl = validMedia[0].url;

  mainImage.innerHTML = `
    <img src="${firstUrl}" 
         style="width:100%;height:100%;object-fit:contain;">
  `;

  validMedia.forEach((mediaItem) => {

    const thumbUrl = mediaItem.url;

    const thumb = document.createElement("div");
    thumb.classList.add("thumb");

    thumb.style.backgroundImage = `url("${thumbUrl}")`;
    thumb.style.backgroundSize = "cover";
    thumb.style.backgroundPosition = "center";
    thumb.style.backgroundRepeat = "no-repeat";

    thumb.addEventListener("click", () => {
      mainImage.innerHTML = `
        <img src="${thumbUrl}" 
             style="width:100%;height:100%;object-fit:contain;">
      `;
    });

    thumbnailContainer.appendChild(thumb);
  });

} else {

  mainImage.innerHTML = `
    <img src="/assets/img/no-image.png"
         style="width:100%;height:100%;object-fit:contain;">
  `;
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

