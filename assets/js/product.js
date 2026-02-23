document.addEventListener("DOMContentLoaded", async () => {

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  if (!id || isNaN(id)) {
    document.querySelector(".product-container").innerHTML =
      "<h2>ID inválido o no especificado</h2>";
    return;
  }

  try {

    // 🔥 CAMBIÁ ESTA URL POR TU ENDPOINT REAL
    const response = await fetch("https://dango.gonzamansilla0149.workers.dev/api/products");

    if (!response.ok) {
      throw new Error("Error al obtener productos");
    }

    const products = await response.json();

    const product = products.find(p => Number(p.id) === id);

    if (!product) {
      document.querySelector(".product-container").innerHTML =
        "<h2>Producto no encontrado</h2>";
      return;
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
    if (brand) brand.textContent = product.brand;
    if (price) price.textContent = `$${Number(product.price).toLocaleString()}`;
    if (description) description.textContent = product.description;
    if (breadcrumb) breadcrumb.textContent = product.name;

    // ===============================
    // IMAGEN
    // ===============================

    if (product.images && product.images.length > 0 && mainImage) {
      mainImage.style.backgroundImage = `url(${product.images[0]})`;
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
          if (drawer) {
            drawer.classList.add("active");
          }

        } else {
          console.error("addToCart no está definido");
        }

      });
    }

  } catch (error) {
    console.error("Error cargando producto:", error);
    document.querySelector(".product-container").innerHTML =
      "<h2>Error cargando producto</h2>";
  }

});
