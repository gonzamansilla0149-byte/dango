document.addEventListener("DOMContentLoaded", async () => {

  const featuredContainer = document.getElementById("featured-products");
  const heroSection = document.querySelector(".hero");

  try {

const response = await fetch("/api/products");

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

  const fragment = document.createDocumentFragment();

  list.forEach(product => {

    const wrapper = document.createElement("div");
    wrapper.innerHTML = createProductCard(product);

    fragment.appendChild(wrapper.firstElementChild);
  });

  container.appendChild(fragment);
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

      // 🔥 Construir lista de imágenes del hero
const heroImages = herramientas
  .map(p => {
    const mediaItem = (p.media || []).find(m => m.url);
    return mediaItem ? optimizeImage(mediaItem.url) : null;
  })
  .filter(Boolean);
// 🔥 Precargar imágenes
heroImages.forEach(src => {
  const img = new Image();
  img.src = src;
});



let currentHeroIndex = 0;

function changeHeroBackground() {

  if (heroImages.length === 0) return;

  const image = heroImages[currentHeroIndex];

  heroSection.style.backgroundImage = `
    linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
    url('${image}')
  `;

  currentHeroIndex =
    (currentHeroIndex + 1) % heroImages.length;
}
changeHeroBackground();
setInterval(changeHeroBackground, 5000);

} // 👈 ESTE CIERRA el if (heroSection)

// ===============================
// BLOQUES DINÁMICOS INTELIGENTES (5 CARTELERAS)
// ===============================

const dynamicContainer = document.getElementById("dynamic-blocks-container");

function getUserHistory() {
  return JSON.parse(localStorage.getItem("userHistory")) || [];
}

function getInterestRanking(history) {
  const counter = {};

  history.forEach(item => {
    const key = item.value?.toLowerCase();
    if (!key) return;
    counter[key] = (counter[key] || 0) + 1;
  });

  return Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
}

function buildDynamicBlocks(products) {

  if (!dynamicContainer) return;

  const history = getUserHistory();
  const rankedInterests = getInterestRanking(history);

  let blocks = [];

  // 🔹 Caso SIN historial → fallback global
  if (rankedInterests.length === 0) {

    const topGlobal = [...products]
      .sort((a,b) => (b.sales || 0) - (a.sales || 0))
      .slice(0, 40);

    for (let i = 0; i < 5; i++) {
      blocks.push({
        title: i === 0 
          ? "Lo más vendido en Dango"
          : "Productos populares",
        items: topGlobal.slice(i * 8, (i + 1) * 8)
      });
    }

  } else {

    rankedInterests.slice(0, 5).forEach((interest, index) => {

      const filtered = products.filter(p =>
        p.category_name?.toLowerCase() === interest
      );

      if (filtered.length === 0) return;

      blocks.push({
        title: index === 0
          ? `Porque viste ${interest}`
          : `Más sobre ${interest}`,
        items: filtered
          .sort((a,b) => (b.sales || 0) - (a.sales || 0))
          .slice(0, 8)
      });
    });
  }

  renderDynamicBlocks(blocks.slice(0,5));
}

function renderDynamicBlocks(blocks) {

  dynamicContainer.innerHTML = "";

  blocks.forEach(block => {

    const section = document.createElement("div");
    section.className = "dynamic-block";

    section.innerHTML = `
      <div class="dynamic-header">
        <h2>${block.title}</h2>
      </div>
      <div class="dynamic-products">
        ${block.items.map(p => createProductCard(p)).join("")}
      </div>
    `;

    dynamicContainer.appendChild(section);
  });
}

// Ejecutar
buildDynamicBlocks(products);
    
// ===============================
// CREAR CARD
// ===============================

function createProductCard(product) {

let image = "/assets/img/no-image.png";

if (product.media && product.media.length > 0) {
  const firstMedia = product.media.find(m => m.url);

  if (firstMedia) {
    image = optimizeImage(firstMedia.url);
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

function optimizeImage(url) {
  if (!url) return "/assets/img/no-image.png";
  return url;
}

  } catch (error) {
    console.error("Error cargando home:", error);
  }

});
