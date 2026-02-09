// Leer categoría desde la URL (?cat=)
const params = new URLSearchParams(window.location.search);
const category = params.get("cat");

// Cambiar título y breadcrumb si estamos en categoria.html
if (category) {
  const categoryNames = {
    celulares: "Celulares",
    computacion: "Computación",
    herramientas: "Herramientas",
    accesorios: "Accesorios",
    ofertas: "Ofertas"
  };

  const name = categoryNames[category] || "Productos";

  const title = document.querySelector(".category-header h1");
  const breadcrumb = document.querySelector(".breadcrumb");

  if (title) title.textContent = name;
  if (breadcrumb) breadcrumb.textContent = `Inicio / ${name}`;
}

