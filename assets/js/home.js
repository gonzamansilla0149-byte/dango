document.addEventListener("DOMContentLoaded", () => {

  const featuredContainer = document.getElementById("featured-products");
  const herramientasContainer = document.getElementById("home-herramientas");
  const heroSection = document.querySelector(".hero");

  if (typeof products === "undefined") return;

  // ===============================
  // UTILIDADES
  // ===============================

  function shuffle(array) {
    return [...array].sort(() => 0.5 - Math.random());
  }

  function getTopBySales(list, limit = 5) {

    const withSales = list.filter(p => p.sales && p.sales > 0);

    if (withSales.length === 0) {
      return shuffle(list).slice(0, limit);
    }

    return withSales
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  }

  function renderProducts(container, list) {
    container.innerHTML = "";
    list.forEach(product => {
      container.innerHTML += createProductCard(product);
    });
  }

  // ===============================
  // TOP GLOBAL (5 productos)
  // ===============================

  if (featuredContainer) {
    const topGlobal = getTopBySales(products, 5);
    renderProducts(featuredContainer, topGlobal);
  }

  // ===============================
  // TOP HERRAMIENTAS (5 productos)
  // ===============================

  if (herramientasContainer) {

    const herramientas = products.filter(
      p => p.category.toLowerCase() === "herramientas"
    );

    const topHerramientas = getTopBySales(herramientas, 5);

    renderProducts(herramientasContainer, topHerramientas);
  }

  // ===============================
  // HERO DINÁMICO (IMÁGENES ALEATORIAS)
  // ===============================

  if (heroSection) {

    const herramientas = products.filter(
      p => p.category.toLowerCase() === "herramientas"
    );

    function getRandomImage() {
      if (herramientas.length === 0) return null;

      const randomProduct =
        herramientas[Math.floor(Math.random() * herramientas.length)];

      return randomProduct.images[0];
    }

    function changeHeroBackground() {

      const image = getRandomImage();
      if (!image) return;

      heroSection.style.backgroundImage = `
        linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
        url('${image}')
      `;

      heroSection.style.backgroundSize = "cover";
      heroSection.style.backgroundPosition = "center";
      heroSection.style.backgroundRepeat = "no-repeat";
    }

    // Primera carga
    changeHeroBackground();

    // Cambia cada 5 segundos
    setInterval(changeHeroBackground, 5000);
  }

});


// ===============================
// CREAR CARD
// ===============================

function createProductCard(product) {
  return `
    <article class="product-card">
      <div class="product-image" 
           style="background-image:url('${product.images[0]}');
                  background-size:cover;
                  background-position:center;">
      </div>
      <h3>${product.name}</h3>
      <p class="price">$${product.price.toLocaleString()}</p>
      <a href="producto.html?id=${product.id}">Ver producto</a>
    </article>
  `;
}
