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
      `https://dango.gonzamansilla0149.workers.dev/api/products/${id}`
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

    if (stockUnits) {
      stockUnits.textContent = product.stock ?? 0;
    }

    if (Number(product.stock) > 0 && Number(product.stock) <= 5) {
      stockUnits.style.color = "orange";
    }

    if (Number(product.stock) <= 0) {
      if (buyBtn) buyBtn.disabled = true;
      if (addBtn) addBtn.disabled = true;

      if (stockUnits) {
        stockUnits.textContent = "Sin stock";
        stockUnits.style.color = "red";
      }
    }

    // ===============================
    // IMAGEN
    // ===============================

    if (mainImage && product.image_url) {
      mainImage.style.backgroundImage = `url(${product.image_url})`;
      mainImage.style.backgroundSize = "cover";
      mainImage.style.backgroundPosition = "center";
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
