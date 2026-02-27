document.addEventListener("DOMContentLoaded", async () => {

  const featuredContainer = document.getElementById("featured-products");
  const heroSection = document.querySelector(".hero");

  try {

    const response = await fetch(
      "https://dango.gonzamansilla0149.workers.dev/api/products"
    );

    const products = await response.json();

    if (!products || products.length === 0) return;

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

    const normalize = str => (str || "").toLowerCase().trim();
    
    function renderProducts(container, list) {
      container.innerHTML = "";
      list.forEach(product => {
        container.innerHTML += createProductCard(product);
      });
    }

    // ===============================
    // TOP GLOBAL (DESTACADOS)
    // ===============================

    if (featuredContainer) {
      const topGlobal = getTopBySales(products, 5);
      renderProducts(featuredContainer, topGlobal);
    }

    // ===============================
    // TOP POR CATEGORÍA (DINÁMICO)
    // ===============================

    const categories = [
      "herramientas",
      "celulares",
      "computacion",
      "accesorios"
    ];

    categories.forEach(category => {

      const container = document.getElementById(`home-${category}`);
      if (!container) return;

      const filtered = products.filter(
        p => normalize(p.category_name) === normalize(category)
      );

      const topByCategory = getTopBySales(filtered, 5);

      renderProducts(container, topByCategory);

    });

    // ===============================
    // HERO DINÁMICO
    // ===============================

    if (heroSection) {

      const herramientas = products.filter(
        p => normalize(p.category_name) === "herramientas"
      );

      function getRandomImage() {
        if (herramientas.length === 0) return null;

        const randomProduct =
          herramientas[Math.floor(Math.random() * herramientas.length)];

        if (randomProduct.media && randomProduct.media.length > 0) {
  const first = randomProduct.media[0];
  if (first.type === "image") {
    return first.url;
  }
}

return null;
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

      changeHeroBackground();
      setInterval(changeHeroBackground, 5000);
    }

  } catch (err) {
    console.error("Error cargando home:", err);
  }

});


// ===============================
// CREAR CARD
// ===============================

function createProductCard(product) {

let image = "";

if (product.media && product.media.length > 0) {
  const firstMedia = product.media[0];

  if (firstMedia.type === "image") {
    image = firstMedia.url;
  }
}

  return `
    <article class="product-card">
      <a href="producto.html?id=${product.id}" class="product-link">
        <div class="product-image" 
             style="
               background-image:url('${image}');
               background-size:cover;
               background-position:center;
               background-repeat:no-repeat;
             ">
        </div>
        <h3>${product.name}</h3>
        <p class="price">$${Number(product.price).toLocaleString()}</p>
      </a>
    </article>
  `;
}
