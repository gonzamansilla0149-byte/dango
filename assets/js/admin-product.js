const API_URL = "https://dango.gonzamansilla0149.workers.dev";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (!productId) {
  console.log("No hay ID en la URL");
}

// Cargar producto desde la DB
async function loadProduct() {
  try {

    const res = await fetch(`${API_URL}/api/products/${productId}`);
    const product = await res.json();

    if (!product || !product.id) {
      console.log("Producto no encontrado");
      return;
    }

    // Llenar inputs
    document.getElementById("edit-name").value = product.name || "";
    document.getElementById("edit-brand").value = product.brand || "";
    document.getElementById("edit-price").value = product.price || 0;
    document.getElementById("edit-description").value = product.description || "";
    document.getElementById("edit-image").value = product.image_url || "";
    document.getElementById("edit-stock").value = product.stock || 0;

  } catch (error) {
    console.error("Error cargando producto:", error);
  }
}

// Guardar cambios
document.getElementById("save-product").addEventListener("click", async () => {

  const updatedProduct = {
    name: document.getElementById("edit-name").value,
    brand: document.getElementById("edit-brand").value,
    price: Number(document.getElementById("edit-price").value),
    description: document.getElementById("edit-description").value,
    image_url: document.getElementById("edit-image").value,
    stock: Number(document.getElementById("edit-stock").value)
  };

  try {

    await fetch(`${API_URL}/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct)
    });

    alert("Producto actualizado correctamente");

  } catch (error) {
    console.error("Error actualizando producto:", error);
  }

});

loadProduct();
