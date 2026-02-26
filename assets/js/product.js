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

    const response = await fetch(
      "https://dango.gonzamansilla0149.workers.dev/api/products"
    );

    if (!response.ok) {
      throw new Error("Error al obtener productos");
    }

    const products = await response.json();

    const product = products.find(p => Number(p.id) === id);

    if (!product) {
      container.innerHTML = "<h2>Producto no encontrado</h2>";
      return;
    }

    // ===============================
    // PRODUCTOS RELACIONADOS
    // ===============================

    const relatedTrack = document.getElementById("related-track");

    if (relatedTrack) {

      const relatedProducts = products
        .filter(p =>
          p.category_name === product.category_name &&
          Number(p.id) !== Number(product.id)
        )
        .slice(0, 8);

      if (relatedProducts.length === 0) {
        relatedTrack.innerHTML = "<p>No hay productos relacionados.</p>";
      } else {

        relatedTrack.innerHTML = relatedProducts.map(p => `
          <article class="product-card">
            <div class="product-image"
              style="background-image:url('${p.image_url || ""}');
                     background-size:cover;
                     background-position:center;">
            </div>
            <h3>${p.name}</h3>
            <p class="price">$${Number(p.price).toLocaleString()}</p>
            <button onclick="location.href='producto.html?id=${p.id}'">
              Ver producto
            </button>
          </article>
        `).join("");
      }
    }

    // ===============================
    // ELEMENTOS
    // ===============================

    const title = document.querySelector(".product-title");
    const brand = document.querySelector(".product-brand");
    const price = document.querySelector(".product-price");
    const description = document.querySelector(".product-description");
    const mainImage = document.querySelector(".main-image");
    const breadcrumb = document.querySelector(".breadcrumb-product");

    // ===============================
    // RENDER DATOS
    // ===============================

    if (title) title.textContent = product.name;
    if (brand) brand.textContent = product.brand_name || "";
    if (price) price.textContent = `$${Number(product.price).toLocaleString()}`;
    if (description) description.textContent = product.description || "";
    if (breadcrumb) breadcrumb.textContent = product.name;

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

    const addBtn = document.querySelector(".add-to-cart-btn");
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

        } else {
          console.error("addToCart no está definido");
        }

      });
    }


    // ===============================
// QUICK CHECKOUT (COMPRAR AHORA)
// ===============================

const buyBtn = document.getElementById("buy-now-btn");
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

    // Validar campos
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
    
    // Acá después podemos conectar pasarela de pago

  });

}
  } catch (error) {
    console.error("Error cargando producto:", error);
    container.innerHTML = "<h2>Error cargando producto</h2>";
  }

});
