export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =========================
    // ADMIN AUTH + LOGIN
    // =========================
    const isAdminHost = url.hostname === "admin.saboresdelfogon.com";
    const isApiRoute = url.pathname.startsWith("/api/");


    const ADMIN_USER = "SDF4358";
    const ADMIN_PASS = "saboresdelfogon1934";

    function getCookie(request, name) {
      const cookie = request.headers.get("Cookie") || "";
      const match = cookie.match(new RegExp(`${name}=([^;]+)`));
      return match ? match[1] : null;
    }

    function haversine(lat1, lng1, lat2, lng2) {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
    
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    
    function deliveryTimeOrder(t) {
  if (!t) return 99;
  const m = t.match(/^(\d{1,2})/);
  return m ? Number(m[1]) : 99;
}

  if (url.pathname === "/" && request.method === "GET") {
 const error = url.searchParams.get("error");

  return new Response (`

<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Admin · Sabores del Fogón</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root{
  --bg:#0f0f0f;
  --card:#1b1b1b;
  --text:#cfcac2;
  --muted:#9a958d;
  --accent:#D3AE09;
}
body{
  margin:0;
  background:var(--bg);
  color:var(--text);
  font-family:Arial,sans-serif;
  display:flex;
  align-items:center;
  justify-content:center;
  height:100vh;
}
.box{
  background:var(--card);
  padding:24px;
  border-radius:14px;
  width:100%;
  max-width:340px;
  box-shadow:0 8px 20px rgba(0,0,0,.4);
}
h1{
  font-size:16px;
  text-align:center;
  margin-bottom:18px;
  color:var(--muted);
}
input{
  width:100%;
  padding:14px;
  margin-bottom:12px;
  border-radius:8px;
  border:1px solid #333;
  background:#111;
  color:var(--text);
}
button{
  width:100%;
  padding:14px;
  border:none;
  border-radius:10px;
  background:var(--accent);
  color:#2a2a2a;
  font-weight:600;
  cursor:pointer;
}
.error{
  color:#ff4d4f;
  font-size:13px;
  text-align:center;
  margin-bottom:10px;
}

</style>
</head>
<body>
<form class="box" method="POST" action="/login">
  <h1>Acceso administrador</h1>
  ${error ? `<div class="error">Usuario o contraseña incorrectos</div>` : ""}
  <input name="user" placeholder="Usuario" required>
  <input name="pass" type="password" placeholder="Contraseña" required>
  <button>Ingresar</button>
</form>
</body>
</html>
`, {
  headers: {
    "Content-Type": "text/html",
    "Cache-Control": "no-store"
  }
});
      }

      // 👉 LOGIN HANDLER
      if (url.pathname === "/login" && request.method === "POST") {
        const body = await request.text();
        const params = new URLSearchParams(body);

        const user = params.get("user");
        const pass = params.get("pass");

        if (user === ADMIN_USER && pass === ADMIN_PASS) {
          (null, {
            status: 302,
            headers: {
              "Set-Cookie": "admin_session=ok; HttpOnly; Path=/; SameSite=Strict",
              "Location": "/dashboard"
            }
          });
        }

        (null, {
          status: 302,
          headers: { "Location": "/?error=1" }
        });
      }

      const TODAY = new Date().toISOString().slice(0, 10);

      async function getConfirmedOrders(env, page = 1, limit = 10, date = null) {
        const indexKey = date
          ? `admin:orders_by_date:${date}`
          : "admin:orders_index";
      
        const index =
          (await env.PEDIDOS_KV.get(indexKey, "json")) || [];
      
        const total = index.length;
      
        const start = (page - 1) * limit;
        const slice = index.slice(start, start + limit);
      
        const orders = [];
      
        await Promise.all(
          slice.map(async (orderId) => {
            const [confirmed, base] = await Promise.all([
              env.PEDIDOS_KV.get(`pedido:${orderId}`, "json"),
              env.PEDIDOS_KV.get(`pedido_base:${orderId}`, "json")
            ]);
      
            if (!confirmed || !base) return;

            const orderDate =
  base.orderDate ||
  new Date(base.createdAt).toISOString().slice(0, 10);

// ❌ excluir pedidos pasados (ayer o antes)
if (orderDate < TODAY) return;

      
            base.items.forEach((item, index) => {
              orders.push({
                order_id: orderId,
                group: base.items.length > 1,
                picada_index: index + 1,
                name: base.clientName,
                whatsapp: base.clientWhatsapp,
                model: item.model,
                size: item.size,
                price: item.price,
                amount: confirmed.amount,
                confirmedAt: confirmed.confirmedAt,
                deliveryTime: base.deliveryTime || null,
                zone: base.zone || "-",
                address: base.address || "-",
                date: (
  base.orderDate
    ? new Date(base.orderDate + "T00:00:00").getTime()
    : base.createdAt
)
              });
            });
          })
        );
      
        return { orders, total };
      }
      
      
      if (url.pathname === "/dashboard") {
        const session = getCookie(request, "admin_session");
        if (session !== "ok") {
          const error = url.searchParams.get("error");
          return new Response(null, {
            status: 302,
            headers: { "Location": "/" }
          });
        }
      
        const page = Number(url.searchParams.get("page") || 1);
        const mode = url.searchParams.get("mode") || "live";
        const date = url.searchParams.get("date"); // YYYY-MM-DD o null
        const view = url.searchParams.get("view") || "home";

        let orders = [];
        let total = 0;
        let route = null;

        
        const isValidDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date);

if (mode === "route" && isValidDate) {
          const routeKey = `route:${date}`;
          route = await env.PEDIDOS_KV.get(routeKey, "json");
          
          const dayKey = `admin:orders_by_date:${date}`;
          const dayOrders =
            (await env.PEDIDOS_KV.get(dayKey, "json")) || [];
          
          if (!route) {
            route = {
              date,
              orders: [...dayOrders],
              excluded: [],
              updatedAt: Date.now()
            };
          
            await env.PEDIDOS_KV.put(routeKey, JSON.stringify(route));
          } else {
            // 🔄 SINCRONIZAR pedidos nuevos del día
            const existing = new Set(route.orders);
            const excluded = new Set(route.excluded || []);
          
            for (const id of dayOrders) {
              if (!existing.has(id) && !excluded.has(id)) {
                route.orders.push(id);
              }
            }
          
            await env.PEDIDOS_KV.put(routeKey, JSON.stringify(route));
          }
          
          
          

          const ids = route.orders;
        
          total = ids.length;
        
          for (const orderId of ids) {
            const [confirmed, base] = await Promise.all([
              env.PEDIDOS_KV.get(`pedido:${orderId}`, "json"),
              env.PEDIDOS_KV.get(`pedido_base:${orderId}`, "json")
            ]);


            if (!confirmed) continue;

            const safeBase = base || {
              clientName: "Cliente",
              clientWhatsapp: "-",
              items: [],
              zone: "-",
              address: "-",
              createdAt: confirmed.confirmedAt
            };
            
            const data = safeBase;

            data.items.forEach((item, index) => {
              orders.push({
                order_id: orderId,
                group: data.items.length > 1,
                picada_index: index + 1,
                name: data.clientName,
                whatsapp: data.clientWhatsapp,
                model: item.model,
                size: item.size,
                amount: confirmed.amount,
                zone: data.zone || "-",
                address: data.address || "-",
                deliveryTime: base.deliveryTime || null,
                date: (
  data.orderDate
    ? new Date(data.orderDate + "T00:00:00").getTime()
    : data.createdAt
)
              });
            });            
          }

          orders.sort((a, b) => {
            return (
              route.orders.indexOf(a.order_id) -
              route.orders.indexOf(b.order_id)
            );
          });
        
        } else {
          // 🔹 modo normal: últimos pedidos
          const res = await getConfirmedOrders(env, page, 10, null);
          orders = res.orders;
          total = res.total;
        }

 // ✅ ordenar por fecha: más cercana a HOY ARRIBA
if (mode !== "route") {
  orders.sort((a, b) => {
  if (a.date !== b.date) {
    return a.date - b.date;
  }
  return deliveryTimeOrder(a.deliveryTime) -
         deliveryTimeOrder(b.deliveryTime);
});

}

const totalPages = Math.max(1, Math.ceil((total || orders.length) / 10));

const excludedSet =
  mode === "route" && route?.excluded
    ? new Set(route.excluded)
    : new Set();

        
        return new Response(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
        <meta charset="UTF-8">
        <title>Admin · Pedidos</title>
        <meta 
  name="viewport" 
  content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
/>
        <style>

        body.sidebar-open #menuToggle {
          display: none;
        }
        
        /* ===== SIDEBAR ===== */
#sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: #111;
  color: #cfcac2;
  padding: 20px;
  z-index: 1001;
}

#sidebar h3 {
  margin-top: 0;
  color: #D3AE09;
  font-size: 16px;
}

.menu-item {
  display: block;
  padding: 10px 0;
  color: #cfcac2;
  text-decoration: none;
  font-weight: 600;
}

.menu-item:hover {
  color: #D3AE09;
}

/* Overlay mobile */
#sidebarOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  display: none;
  z-index: 1000;
}

/* Botón hamburguesa */
#menuToggle {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1100;
  background: none;
  border: none;
  color: #D3AE09;
  font-size: 24px;
}

/* ===== MOBILE ===== */
@media (max-width: 768px) {
  #sidebar {
    transform: translateX(-100%);
    transition: transform .25s ease;
  }

  body.sidebar-open #sidebar {
    transform: translateX(0);
  }

  body.sidebar-open #sidebarOverlay {
    display: block;
  }

  #menuToggle {
    display: block;
  }

  body {
    padding-left: 0;
  }
}

.hidden {
  display: none;
}

/* ===== DESKTOP ===== */
@media (min-width: 769px) {
  #mainContent {
    margin-left: 280px;   /* más aire */
    padding-right: 16px; /* respiración derecha */
  }
}


        body{
          background:#0f0f0f;
          color:#cfcac2;
          font-family:Arial;
          padding:24px;
          overflow-x: hidden;
        }
        #mainContent {
          max-width: 100%;
        }
        

        .card{
          background:#1b1b1b;
          border-radius:14px;
          padding:14px;
          margin-left:-8px;
          margin-right:-8px;
        }        
        @media (max-width: 768px) {
          .card {
            margin-top: 48px;
          }
        }        
        .table-wrap{
          overflow-x:auto;
          -webkit-overflow-scrolling: touch;
        }
        table{
          width:100%;
          border-collapse:collapse;
          font-size:14px;
        }
        th, td{
          padding:6px 8px;
          border-bottom:1px solid #333;
          text-align:left;
          white-space:nowrap;
        }        
        th{
          color:#9a958d;
        }
        .btn{
          padding:6px 10px;
          border-radius:8px;
          background:#D3AE09;
          color:#2a2a2a;
          font-size:12px;
          text-decoration:none;
          font-weight:600;
        }
        .pagination{
          margin-top:16px;
          display:flex;
          gap:8px;
        }
        .pagination a{
          color:#cfcac2;
          text-decoration:none;
        }
        .more-btn{
          background:none;
          border:none;
          color:#D3AE09;
          font-size:20px;
          font-weight:bold;
          cursor:pointer;
          line-height:1;
        }
      
        .model-cell{
          white-space: normal;
          line-height: 1.1;
          max-width: 90px;
        }
        /* Estado base: DESKTOP */
        tr.mobile-only,
        th.mobile-only,
        td.mobile-only {
          display: none;
        }
        
        tr.desktop-only {
          display: table-row;
        }
        
        th.desktop-only,
        td.desktop-only {
          display: table-cell;
        }
        
        /* MOBILE */
        @media (max-width: 768px){
          tr.desktop-only,
          th.desktop-only,
          td.desktop-only {
            display: none !important;
          }
        
          tr.mobile-only {
            display: table-row;
          }
        
          th.mobile-only,
          td.mobile-only {
            display: table-cell;
          }
        }
        /* ===== CONTROLES DE RUTA ===== */
.route-only {
  display: none;
}

body.route-mode .route-only {
  display: inline-block;
}

body.route-mode .route-hide-on-route {
  display: none;
}
        </style>
        </head>
        <body>
        <div id="sidebarOverlay"></div>

<aside id="sidebar">
  <h3>Sabores del Fogón</h3>

  <a href="/dashboard" class="menu-item">Inicio</a>
  <a href="/dashboard?view=report" class="menu-item">Reporte</a>
</aside>

<button id="menuToggle">☰</button>

        <div id="mainContent">

        ${view === "report" ? `
  <div id="reportView">

    <!-- ===== MODULO SUPERIOR ===== -->
    <div class="card" style="margin-bottom:16px">
      <h3>Reporte de ventas</h3>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
      <input
      type="date"
      id="reportFrom"
      max="${(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0,10);
      })()}"
      value="${(() => {
        const d = new Date();
        d.setDate(d.getDate() - 31);
        return d.toISOString().slice(0,10);
      })()}"
    />
    
    <input
      type="date"
      id="reportTo"
      max="${(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0,10);
      })()}"
      value="${(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0,10);
      })()}"
    />
    
    
    <button class="btn" id="btnLoadReport">Ver reporte</button>
      </div>

      <div style="display:flex;gap:16px;flex-wrap:wrap">
<div><b id="rTotal">Total:</b></div>
<div><b id="rPicadas">Picadas:</b></div>
<div><b id="rEnvios">Envíos:</b></div>

    </div>
    
    </div>

    <!-- ===== MODULO INFERIOR ===== -->
    <div class="card">
      <h3>Pedidos del período</h3>
      <div id="reportTable"></div>
      <p id="reportHint" style="font-size:13px;color:#9a958d">
      Seleccioná un rango de fechas para ver los pedidos
    </p>
    
    </div>

  </div>
` : ""}

        <div class="card ${view === "report" ? "hidden" : ""}">
        <h2>${view === "report" ? "Reporte" : "Pedidos confirmados"}</h2>
        <div id="routeControls" class="mobile-only" style="margin:12px 0">

        <div style="display:flex;gap:8px;align-items:center">
          <input
            type="date"
            id="routeDate"
            value="${new Date().toISOString().slice(0,10)}"
            style="flex:1;padding:8px;border-radius:8px;border:1px solid #333;background:#111;color:#cfcac2"
          />
      
          <button class="btn route-hide-on-route" onclick="goToRoute()">
            Ruta
          </button>
        </div>
      
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn route-only" onclick="location.href='/dashboard'">←</button>
          <button class="btn route-only" onclick="optimizeRoute()">Optimizar</button>
          <button class="btn route-only" onclick="invertRoute()">Invertir</button>  
        </div>
      
      </div>
      


        <div class="table-wrap">
        <table>
        <thead>
  <!-- DESKTOP -->
  <tr class="desktop-only">
    <th>Cliente</th>
    <th>Fecha</th>
    <th>Modelo</th>
    <th>Tamaño</th>
    <th>Monto</th>
    <th>Cliente</th>
    <th>Localidad</th>
    <th>Dirección</th>
    <th>Contacto</th>
  </tr>

  <!-- MOBILE -->
  <tr class="mobile-only">
    <th>Cliente</th>
    <th>Fecha</th>
    <th>Modelo</th>
    <th>C/P</th>
    <th>Monto</th>
  </tr>
</thead>
<tbody>
${orders.map(o => `
  <!-- ================= DESKTOP ROW ================= -->
  <tr class="desktop-only"
    data-order-id="${o.order_id}"
    style="${o.group ? 'background:rgba(211,174,9,.06)' : ''}">
  <td class="model-cell">
  <button
  type="button"
  class="details-btn"
  data-id="${o.order_id}-${o.picada_index}"
    style="
      background:none;
      border:none;
      padding:0;
      margin:0;
      color:#D3AE09;
      font-weight:600;
      cursor:pointer;
      text-align:left;
    "
  >
    ${o.name.split(" ").join("<br>")}
  </button>
</td>

<td>
<button
  style="background:none;border:none;color:#D3AE09;cursor:pointer"
  onclick="changeOrderDate('${o.order_id}', '${o.date}')"
>
  ${new Date(o.date).toLocaleDateString("es-AR")}
<br>
<span style="font-size:12px;color:#9a958d">
  ${o.deliveryTime || "-"}
</span>
</button>
</td>
    <td>${o.model}</td>
    <td>${o.size}</td>
    <td>$${o.amount.toLocaleString()}</td>
    <td>${o.name}</td>
    <td>${o.zone}</td>
    <td>
      <a target="_blank"
         href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address + ', ' + o.zone)}"
         style="color:#D3AE09;text-decoration:none">
        ${o.address}
      </a>
    </td>
    <td>
  <a class="btn" target="_blank"
     href="https://wa.me/549${o.whatsapp.replace(/\D/g,'')}">
    WhatsApp
  </a>
</td>


  </tr>

  <!-- ================= MOBILE ROW ================= -->
  <tr class="mobile-only"
    data-order-id="${o.order_id}"
    style="${o.group ? 'background:rgba(211,174,9,.06)' : ''}">
  <td>
  <button
  type="button"
  class="details-btn"
  data-id="${o.order_id}-${o.picada_index}"
  style="
      background:none;
      border:none;
      padding:0;
      margin:0;
      color:#D3AE09;
      font-weight:600;
      cursor:pointer;
    "
  >
  ${o.name.split(" ").join("<br>")}
  </button>
  </td>

  <td>
    ${new Date(o.date).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "numeric",
      year: "2-digit"
    })}
  </td>
  <td class="model-cell">${o.model.split(" ").join("<br>")}</td>
  <td>${o.size}</td>
  <td>$${o.amount.toLocaleString()}</td>
</tr>
`).join("")}

</tbody>
</table>
</div> <!-- cierre .table-wrap -->

<!-- CONTENEDORES OCULTOS DE DETALLES -->
<div id="details-container" style="display:none">
  ${orders.map(o => `
    <div id="details-${o.order_id}-${o.picada_index}">
      <h3>Pedido ${o.order_id}</h3>
      <p style="font-size:12px;color:#9a958d">
        Ticket ID: ${o.order_id}-${o.picada_index}
      </p>

      <p><b>Cliente:</b> ${o.name}</p>
      <p><b>WhatsApp:</b> ${o.whatsapp}</p>
      <p><b>Fecha:</b> ${new Date(o.date).toLocaleDateString("es-AR")}</p>
      <p><b>Horario de entrega:</b> ${o.deliveryTime || "-"}</p>
      <p><b>Picada:</b> ${o.model} (${o.size} personas)</p>
      <p><b>Dirección:</b> ${o.address}, ${o.zone}</p>
      <p><b>Monto:</b> $${o.amount.toLocaleString()}</p>

      <p>
        <a class="btn" target="_blank"
        href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address + ', ' + o.zone)}">
          Ver en Google Maps
        </a>
      </p>

      <p>
        <a class="btn" target="_blank"
           href="https://wa.me/549${o.whatsapp.replace(/\\D/g,'')}">
          WhatsApp
        </a>
      </p>

      <hr style="border-color:#333;margin:16px 0">

      <button class="btn" onclick="printTicket(this, '${o.order_id}-${o.picada_index}')">
        Imprimir ticket
      </button>
    </div>
  `).join("")}
</div>

        </div>
        
        ${view !== "report" ? `
        <div class="pagination">
          ${page > 1 ? `<a href="/dashboard?page=${page-1}">← Anterior</a>` : ""}
          ${page < totalPages ? `<a href="/dashboard?page=${page+1}">Siguiente →</a>` : ""}
        </div>
      ` : ""}
      
        
        </div>
        <!-- POPUP -->
        <div id="popup" onclick="closeDetails()" style="
        display:none;
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.7);
        z-index:9999;
      ">
        <div onclick="event.stopPropagation()" style="
          background:#1b1b1b;
          color:#cfcac2;
          padding:20px;
          border-radius:14px;
          margin:10% auto;
          max-width:90%;
        ">      
    <button onclick="closeDetails()" style="float:right">✕</button>
    <div id="popup-content"></div>
  </div>
</div>
<script>


const ORIGIN = { lat: -34.6473, lng: -58.8616 }; // tu base
function openDetails(id) {
  const popup = document.getElementById("popup");
  const content = document.getElementById("popup-content");

  // 1️⃣ intento clásico (tabla principal)
  const source = document.getElementById("details-" + id);
  if (source) {
    content.innerHTML = source.innerHTML;
    popup.style.display = "block";
    return;
  }

  // 2️⃣ fallback para REPORTE
  const orderId = id.slice(0, id.lastIndexOf("-"));

  fetch("/api/order/details?order_id=" + encodeURIComponent(orderId))
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data || data.status === "pending" || !Array.isArray(data.items)) {
        content.innerHTML =
          "<h3>Pedido " + orderId + "</h3>" +
          "<p style='color:#9a958d;font-size:13px'>" +
          "No hay detalle completo del pedido.<br>" +
          "Puede ser un pedido antiguo o sin base guardada." +
          "</p>";
        popup.style.display = "block";
        return;
      }
      

      const item = data.items[0];

      let html = "";

      // 🔹 Pedido
      html += "<h3>Pedido " + orderId + "</h3>";
      
      // 🔹 Ticket ID (ESTO FALTABA)
      html += "<p style='font-size:12px;color:#9a958d'>";
      html += "Ticket ID: " + id;
      html += "</p>";
      
      // 🔹 Datos cliente
      html += "<p><b>Cliente:</b> " + (data.clientName || "-") + "</p>";
      html += "<p><b>WhatsApp:</b> " + (data.whatsapp || "-") + "</p>";
      html += "<p><b>Fecha:</b> " + (data.orderDate ? new Date(data.orderDate).toLocaleDateString("es-AR") : "-") + "</p>";
      html += "<p><b>Horario de entrega:</b> " +
  (data.deliveryTime || "-") +
  "</p>";

      // 🔹 Producto
      html += "<p><b>Picada:</b> " + item.model + " (" + item.size + " personas)</p>";
      
      // 🔹 Dirección
      html += "<p><b>Dirección:</b> " + (data.address || "-") + ", " + (data.zone || "-") + "</p>";
      
      // 🔹 Monto
      html += "<p><b>Monto:</b> $" + Number(item.price || 0).toLocaleString() + "</p>";
      
      // 🔹 Google Maps
      if (data.address && data.zone) {
        html +=
          "<p><a class='btn' target='_blank' href='https://www.google.com/maps?q=" +
          encodeURIComponent(data.address + ', ' + data.zone) +
          "'>" +
          "Ver en Google Maps" +
          "</a></p>";
      }
      
      
      
      // 🔹 WhatsApp
      if (data.whatsapp) {
        html +=
          "<p><a class='btn' target='_blank' href='https://wa.me/549" +
          data.whatsapp.replace(/\\D/g, "") +
          "'>WhatsApp</a></p>";
      }
      content.innerHTML = html;
      popup.style.display = "block";
    })
    .catch(function () {
      alert("Error al cargar el detalle del pedido");
    });
}

function closeDetails(){
  document.getElementById("popup").style.display = "none";
}
function printTicket(btn, ticketId){
  const container = document.getElementById("popup-content");
  const clone = container.cloneNode(true);

  clone.querySelectorAll("button, a").forEach(el => el.remove());

  // agregar ticket ID arriba del todo
  const header = document.createElement("p");
  header.style.fontSize = "12px";
  header.style.textAlign = "center";
  header.style.color = "#555";
  header.innerText = "Ticket ID: " + ticketId;

  clone.insertBefore(header, clone.firstChild);

  const win = window.open("", "_blank", "width=300");

  win.document.open();
  win.document.write(
    "<!DOCTYPE html>" +
    "<html>" +
    "<head>" +
      "<meta charset='UTF-8'>" +
      "<title>Ticket " + ticketId + "</title>" +
      "<style>" +
        "@page{size:58mm auto;margin:0}" +
        "body{font-family:monospace;font-size:11px;margin:0;padding:6px;width:58mm}" +
        "h3{text-align:center;margin:6px 0;font-size:12px}" +
        "p{margin:3px 0}" +
        "hr{border:none;border-top:1px dashed #000;margin:6px 0}" +
      "</style>" +
    "</head>" +
    "<body>" +
      clone.innerHTML +
    "</body>" +
    "</html>"
  );
  
  
  win.document.close();
  win.focus();
  win.print();
}
const controlsEl = document.getElementById("routeControls");
function reorderTable(orderIds) {
  const tbody = document.querySelector("table tbody");
  if (!tbody) return;

  const rows = [...tbody.querySelectorAll("tr.desktop-only, tr.mobile-only")];

  const map = {};
  rows.forEach(row => {
    const id = row.dataset.orderId;
    if (!id) return;
    if (!map[id]) map[id] = [];
    map[id].push(row);
  });

  tbody.innerHTML = "";

  orderIds.forEach((id, index) => {
    const group = map[id];
    if (!group) return;

    group.forEach(row => {
      // 👉 SOLO EN MODO RUTA
      if (document.body.classList.contains("route-mode")) {
        row.style.borderLeft = "4px solid #D3AE09";
        row.style.background = "rgba(211,174,9,.08)";
      }
      tbody.appendChild(row);
    });
  });
}


function goToRoute() {
  var input = document.getElementById("routeDate");
  if (!input || !input.value) {
    alert("Elegí una fecha");
    return;
  }

  location.href =
    "/dashboard?mode=route&date=" + encodeURIComponent(input.value);
}


  // 1️⃣ ordenar por cercanía (igual que optimize)
  const remaining = [...points];
  const ordered = [];
  let current = ORIGIN;

  while (remaining.length) {
    let farthestIndex = 0;
    let farthestDist = -Infinity;

    remaining.forEach((p, i) => {
      const d = haversine(
        current.lat,
        current.lng,
        p.geo.lat,
        p.geo.lng
      );
      if (d > farthestDist) {
        farthestDist = d;
        farthestIndex = i;
      }
    });

    const next = remaining.splice(farthestIndex, 1)[0];
    ordered.push(next.id);
    current = next.geo;
  }

  // 2️⃣ reordenar tabla en vivo
  reorderTable(ordered);
}

function changeOrderDate(orderId, currentDate) {
  var newDate = prompt(
    "Nueva fecha (YYYY-MM-DD):",
    new Date(currentDate).toISOString().slice(0,10)
  );

  if (!newDate) return;

  fetch("/api/admin/change-date", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_id: orderId,
      date: newDate
    })
  }).then(function () {
    location.reload();
  });
}

function toggleRouteOrder(orderId) {
  var dateEl = document.getElementById("routeDate");
  if (!dateEl || !dateEl.value) {
    alert("Elegí una fecha");
    return;
  }

  var date = dateEl.value;

  fetch("/api/admin/route?date=" + date)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      var route = data.route || {};
      var excluded = route.excluded || [];
      var isExcluded = excluded.includes(orderId);

      return fetch("/api/admin/route?date=" + date, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isExcluded ? "include" : "exclude",
          order_id: orderId
        })
      });
    })
    .then(function () {
      location.reload();
    });
}

const params = new URLSearchParams(location.search);
if (params.get("mode") === "route") {
  document.body.classList.add("route-mode");
  if (controlsEl) controlsEl.style.display = "block";
}

// ===== SIDEBAR MOBILE TOGGLE =====
const menuBtn = document.getElementById("menuToggle");
const sidebarOverlay = document.getElementById("sidebarOverlay");

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-open");
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", () => {
    document.body.classList.remove("sidebar-open");
  });
}



function loadReport() {
  var from = document.getElementById("reportFrom").value;
  var to = document.getElementById("reportTo").value;

  
  const today = new Date().toISOString().slice(0,10);
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0,10);
  })();

  // ❌ bloquear hoy y futuro
  if (to >= today || from >= today) {
    alert("El reporte solo puede ser hasta ayer");
    return;
  }

  if (from > to) {
    alert("La fecha desde no puede ser mayor a la fecha hasta");
    return;
  }

  var container = document.getElementById("reportTable");
container.innerHTML =
  "<p style='color:#9a958d;font-size:13px'>Cargando reporte…</p>";
  var hint = document.getElementById("reportHint");
if (hint) hint.style.display = "none";



  if (!from || !to) {
    alert("Seleccioná un rango de fechas");
    return;
  }

  fetch("/api/admin/report?from=" + from + "&to=" + to, {
    credentials: "same-origin"
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      // ===== TOTALES =====
      document.getElementById("rTotal").innerText =
        "Total: $" + Number(data.total || 0).toLocaleString();

        document.getElementById("rPicadas").innerText =
        "Picadas: $" + Number(data.totalPicadas || 0).toLocaleString();
      
      document.getElementById("rEnvios").innerText =
        "Envíos: $" + Number(data.totalEnvios || 0).toLocaleString();

      // ===== TABLA =====
      var container = document.getElementById("reportTable");
      if (!container) return;

      if (!data.orders || !data.orders.length) {
        container.innerHTML =
          "<p style='color:#9a958d;font-size:13px'>No hay pedidos en el período</p>";
        return;
      }

      var html = "";
      html += "<div class='table-wrap'>";
      html += "<table>";
html += "<thead>";

// ===== DESKTOP =====
html += "<tr class='desktop-only'>";
html += "<th>Fecha</th>";
html += "<th>Modelo</th>";
html += "<th>Tamaño</th>";
html += "<th>Monto</th>";
html += "<th>Cliente</th>";
html += "<th>Localidad</th>";
html += "<th>Dirección</th>";
html += "<th>Contacto</th>";
html += "</tr>";

// ===== MOBILE =====
html += "<tr class='mobile-only'>";
html += "<th>Cliente</th>";
html += "<th>Fecha</th>";
html += "<th>Modelo</th>";
html += "<th>Monto</th>";
html += "</tr>";

html += "</thead>";
      html += "<tbody>";

      data.orders.forEach(function (o) {

  /* ================= DESKTOP ROW ================= */
  html += "<tr class='desktop-only'>";

 html += "<td>"
  + new Date(o.date).toLocaleDateString("es-AR")
  + "<br>"
  + "<span style='font-size:12px;color:#9a958d'>"
  + (o.deliveryTime || "-")
  + "</span>"
  + "</td>";

  html += "<td>" + o.model + "</td>";
  html += "<td>" + o.size + "</td>";
  html += "<td>$" + Number(o.amount).toLocaleString() + "</td>";

  html += "<td>"
    + "<button "
    + "class='details-btn' "
    + "data-id='" + o.order_id + "-" + (o.picada_index || 1) + "' "
    + "style='background:none;border:none;color:#D3AE09;font-weight:600;cursor:pointer;padding:0'>"
    + o.name
    + "</button>"
    + "</td>";

  html += "<td>" + o.zone + "</td>";
  html += "<td>" + o.address + "</td>";

  html += "<td>"
    + "<a class='btn' target='_blank' href='https://wa.me/549"
    + o.whatsapp.replace(/\\D/g, "") +
    "'>WhatsApp</a>"
    + "</td>";

  html += "</tr>";

/* ================= MOBILE ROW ================= */
html += "<tr class='mobile-only'>";

// CLIENTE (ABRE POPUP)
html += "<td>"
  + "<button "
  + "class='details-btn' "
  + "data-id='" + o.order_id + "-" + (o.picada_index || 1) + "' "
  + "style='background:none;border:none;color:#D3AE09;font-weight:600;cursor:pointer;padding:0;text-align:left'>"
  + o.name.split(" ").join("<br>")
  + "</button>"
  + "</td>";

// FECHA → DD/MM/YY
html += "<td>"
  + new Date(o.date).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "numeric",
      year: "2-digit"
    })
  + "<br>"
  + "<span style='font-size:11px;color:#9a958d'>"
  + (o.deliveryTime || "")
  + "</span>"
  + "</td>";

// MODELO → palabra por línea
html += "<td class='model-cell'>"
  + o.model.split(" ").join("<br>")
  + "</td>";

// MONTO
html += "<td>$" + Number(o.amount).toLocaleString() + "</td>";

html += "</tr>";

});

      html += "</tbody>";
      html += "</table>";
      html += "</div>";

      container.innerHTML = html;
    })
    .catch(function (err) {
      console.error(err);
      alert("Error al cargar el reporte");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnLoadReport");
  const from = document.getElementById("reportFrom");
  const to = document.getElementById("reportTo");

  if (btn) {
    btn.addEventListener("click", loadReport);
  }

  // 👉 si estamos en vista reporte y hay fechas por defecto, cargar solo
  if (from && to && from.value && to.value) {
    loadReport();
  }
});


document.addEventListener("click", function (e) {
  const btn = e.target.closest(".details-btn");
  if (!btn) return;

  openDetails(btn.dataset.id);
});




</script>


        </body>
        </html>
        `, {
          headers: {
            "Content-Type": "text/html",
            "Cache-Control": "no-store, no-cache, must-revalidate"
          }
        });
      }

    }

    // =========================
    // CORS (GLOBAL)
    // =========================
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    function json(data, status = 200) {
      return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (request.method === "OPTIONS") {
      return new Response("", {
        status: 200,
        headers: {
          ...corsHeaders,
          "Access-Control-Max-Age": "86400"
        }
      });
    }


    /* =====================================================
   ORDER DETAILS (THANK YOU PAGE)
   ===================================================== */
if (url.pathname === "/api/order/details" && request.method === "GET") {
  const orderId = url.searchParams.get("order_id");

  if (!orderId) {
    return json({ error: "Missing order_id" }, 400);
  }

  const base = await env.PEDIDOS_KV.get(
    `pedido_base:${orderId}`,
    "json"
  );

  const status = await env.PEDIDOS_KV.get(
    `pedido:${orderId}`,
    "json"
  );

  // Todavía no llegó el webhook
  if (!base) {
    return json({ status: "pending" });
  }

  return json({
    status: status?.status || "pending",
    order_id: orderId,
    clientName: base.clientName,
    whatsapp: base.clientWhatsapp,
    items: base.items || [],
    envio: base.envio || 0,
    total: base.total || 0,
    zone: base.zone || "",
    address: base.address || "",
    geo: base.geo || null,
    orderDate: base.orderDate || null,
    deliveryTime: base.deliveryTime || null,
  });
}


    /* =====================================================
       MERCADO PAGO – CREATE PREFERENCE
       ===================================================== */
    if (url.pathname === "/api/mp/create-preference" && request.method === "POST") {
      try {
        const {
          order_id,
          clientName,
          clientEmail,
          clientWhatsapp,
          items,
          envio = 0,
          total,
          fingerprint,
          zone,
          address,
          orderDate,
          deliveryTime,
          fbp,
          fbc,
          user_agent: clientUserAgent,
        } = await request.json();
        
        
        if (!order_id || !items || !items.length) {
          return json({ error: "Datos incompletos" }, 400);
        }
        

        const itemsTotal = items.reduce((sum, p) => sum + Number(p.price || 0), 0);
        const calculatedTotal = itemsTotal + Number(envio || 0);

        if (calculatedTotal !== total) {
          return json({ error: "Total inválido" }, 400);
        }
        

        const description = items
          .map((p, i) => `Picada ${i + 1}: ${p.model} (${p.size}) - $${p.price}`)
          .join(" | ");
          const mpItems = items.map((p, index) => ({
            id: `${order_id}-${index + 1}`,
            title: `Picada ${index + 1} · ${p.model}`,
            description: `${p.size} personas`,
            quantity: 1,
            currency_id: "ARS",
            unit_price: Number(p.price)
          }));
          
          if (envio > 0) {
            mpItems.push({
              id: `${order_id}-envio`,
              title: "Costo de envío",
              quantity: 1,
              currency_id: "ARS",
              unit_price: Number(envio)
            });
          }
          
// Normalizar teléfono (solo números)
const cleanPhone = (clientWhatsapp || "").replace(/\D/g, "");

// Construir payer dinámico (SIN email forzado)
const payer = {};

if (clientName) {
  payer.name = clientName;
}

// Agregar teléfono solo si es válido
if (cleanPhone.length >= 10) {
  payer.phone = {
    area_code: cleanPhone.slice(0, 2),   // ej: 11
    number: cleanPhone.slice(2)          // resto del número
  };
}

const preference = {
  items: mpItems,
  external_reference: order_id,

  binary_mode: true,

  notification_url: "https://saboresdelfogon.com/api/mp/webhook",

  payment_methods: {
    excluded_payment_types: [],
    excluded_payment_methods: [],
    installments: 12
  },

  payer,
  metadata: {
    order_id,
    fbp,
    fbc
  },
  

  back_urls: {
    success: "https://saboresdelfogon.com/gracias",
    failure: "https://saboresdelfogon.com/error",
    pending: "https://saboresdelfogon.com/pendiente"
  },
  auto_return: "approved"
};


    const mpRes = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": order_id,
          "X-Product-Id": "sabores-del-fogon"
        },
        body: JSON.stringify(preference)
      }
    );
    

        const mpData = await mpRes.json();

        if (!mpRes.ok || !mpData.init_point) {
          console.error("MP ERROR:", mpData);
          return json({ error: "No se pudo crear la preferencia" }, 500);
        }
        

        await env.PEDIDOS_KV.put(
          `pedido_base:${order_id}`,
          JSON.stringify({
            order_id,
            clientName,
            clientWhatsapp,
            items,
            envio,
            total,
            zone,
            geo: {
              lat: -34.6037,
              lng: -58.3816
            },
            address,
            orderDate,
            deliveryTime,
        
            // 🔑 META IDENTIFIERS (CLAVE)
            fbp: fbp || null,
            fbc: fbc || null,
            user_agent: clientUserAgent,

        
            createdAt: Date.now()
          }),
          { expirationTtl: 1296000 }
        );
        
        return json({ init_point: mpData.init_point });

      } catch (err) {
        console.error(err);
        return json({ error: "Error Mercado Pago" }, 500);
      }
    }

    /* =====================================================
       MERCADO PAGO – WEBHOOK
       ===================================================== */
    if (url.pathname === "/api/mp/webhook" && request.method === "POST") {
      try {
        const body = await request.json();

// Detectar tipo de evento de Mercado Pago (robusto)
const topic =
  body.type ||
  body.topic ||
  new URL(request.url).searchParams.get("topic") ||
  new URL(request.url).searchParams.get("type");

if (topic !== "payment") {
  return new Response("ok");
}


        const paymentId = body.data.id;
        const paymentRes = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: { "Authorization": `Bearer ${env.MP_ACCESS_TOKEN}` }
          }
        );

        const payment = await paymentRes.json();
        if (payment.status !== "approved") return new Response("ok");

        const order_id = payment.metadata?.order_id || payment.external_reference;

     // =========================
// META CONVERSIONS API – PURCHASE (CON LOGS)
// =========================
try {
  const eventTime = Math.floor(Date.now() / 1000);

  const base = await env.PEDIDOS_KV.get(`pedido_base:${order_id}`, "json");

  const clientIp =
  request.headers.get("CF-Connecting-IP") ||
  request.headers.get("X-Forwarded-For")?.split(",")[0] ||
  request.headers.get("X-Real-IP") ||
  null;

const userData = {
  client_ip_address: clientIp,
  client_user_agent: base?.user_agent
};

if (base?.fbp) userData.fbp = base.fbp;
if (base?.fbc) userData.fbc = base.fbc;


  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: eventTime,
        action_source: "website",
        event_id: order_id, // deduplicación
        user_data: userData,
        custom_data: {
          currency: "ARS",
          value: payment.transaction_amount
        }        
      }
    ],
    access_token: env.META_ACCESS_TOKEN
  };

  console.log("🟡 META CAPI → Enviando evento Purchase", {
    order_id,
    payload
  });

  const metaRes = await fetch(
    `https://graph.facebook.com/v18.0/${env.META_PIXEL_ID}/events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  const metaText = await metaRes.text();

  console.log("🟢 META CAPI ← Respuesta", {
    status: metaRes.status,
    body: metaText
  });

  if (!metaRes.ok) {
    console.error("🔴 META CAPI ERROR HTTP", {
      status: metaRes.status,
      body: metaText
    });
  }

} catch (err) {
  console.error("🔥 META CAPI EXCEPTION", err);
}



        await env.PEDIDOS_KV.put(
          `pedido:${order_id}`,
          JSON.stringify({
            order_id,
            status: "confirmed",
            amount: payment.transaction_amount,
            confirmedAt: Date.now()
          }),
          { expirationTtl: 1296000 }
        );

        const baseKey = `pedido_base:${order_id}`;
const existingBase = await env.PEDIDOS_KV.get(baseKey, "json");

if (!existingBase) {
  await env.PEDIDOS_KV.put(
    baseKey,
    JSON.stringify({
      order_id,
      clientName: payment.payer?.first_name || "Cliente",
      clientWhatsapp: "",
      items: [
        {
          model: "Pedido Mercado Pago",
          size: "-",
          price: payment.transaction_amount
        }
      ],
      envio: 0,
      total: payment.transaction_amount,
      zone: "-",
      address: "-",
      geo: null,
      orderDate: new Date().toISOString().slice(0,10),
      createdAt: Date.now()
    }),
    { expirationTtl: 1296000 }
  );
}

        

const base = await env.PEDIDOS_KV.get(`pedido_base:${order_id}`, "json");

const orderDate =
  base?.orderDate ||
  new Date(base?.createdAt || Date.now()).toISOString().slice(0,10);

const dateIndexKey = `admin:orders_by_date:${orderDate}`;

const byDate =
  (await env.PEDIDOS_KV.get(dateIndexKey, "json")) || [];


byDate.unshift(order_id);

// opcional: limitar tamaño
if (byDate.length > 2000) byDate.length = 2000;

await env.PEDIDOS_KV.put(dateIndexKey, JSON.stringify(byDate));

        // =========================
// ACTUALIZAR ÍNDICE ADMIN
// =========================
const indexKey = "admin:orders_index";

const index =
  (await env.PEDIDOS_KV.get(indexKey, "json")) || [];

  index.unshift(order_id);


// opcional: limitar tamaño del índice (ej 2000 pedidos)
if (index.length > 2000) index.length = 2000;

await env.PEDIDOS_KV.put(indexKey, JSON.stringify(index));

        return new Response("ok");

      } catch {
        ("ok");
      }
    }

    // =====================================================
// ADMIN ROUTES (OPTIMIZACIÓN)
// =====================================================
if (url.pathname === "/api/admin/route") {
  const session = getCookie(request, "admin_session");
  if (session !== "ok") {
    return json({ error: "Unauthorized" }, 401);
  }
  const date = url.searchParams.get("date"); // YYYY-MM-DD
  if (!date) {
    return json({ error: "Missing date" }, 400);
  }

  const routeKey = `route:${date}`;

  // =========================
  // GET → leer ruta
  // =========================
  if (request.method === "GET") {
    const route =
      (await env.PEDIDOS_KV.get(routeKey, "json")) || null;

    return json({ route });
  }

  // =========================
  // POST → crear / actualizar ruta
  // =========================
  if (request.method === "POST") {
    const body = await request.json();
    const { action, order_id } = body;

    let route =
      (await env.PEDIDOS_KV.get(routeKey, "json")) || {
        date,
        orders: [],
        excluded: [],
        updatedAt: Date.now()
      };

    // -------- crear ruta desde pedidos del día
    if (action === "init") {
      const dayKey = `admin:orders_by_date:${date}`;
      const list =
        (await env.PEDIDOS_KV.get(dayKey, "json")) || [];

      route.orders = [...list];
      route.excluded = [];
    }

    // -------- excluir pedido
    if (action === "exclude" && order_id) {
      route.orders = route.orders.filter(id => id !== order_id);
      if (!route.excluded.includes(order_id)) {
        route.excluded.push(order_id);
      }
    }

    // -------- volver a incluir pedido
if (action === "include" && order_id) {
  if (!route.orders.includes(order_id)) {
    route.orders.push(order_id);
  }
  route.excluded = route.excluded.filter(id => id !== order_id);
}


    // -------- invertir ruta
    if (action === "invert") {
      route.orders.reverse();
    }
    
    if (action === "optimize") {

      const ORIGIN = {
        lat: -34.6473,
        lng: -58.8616
      };
    
      const remaining = [];
      const geoMap = {};
    
      for (const id of route.orders) {
        const base = await env.PEDIDOS_KV.get(`pedido_base:${id}`, "json");
      
        if (base?.geo?.lat != null && base?.geo?.lng != null) {
          geoMap[id] = base.geo;
          remaining.push(id);
        }
      }
      
    
      const ordered = [];
      let current = ORIGIN;
    
      while (remaining.length) {
        let closestId = null;
        let closestDist = Infinity;
    
        for (const id of remaining) {
          const geo = geoMap[id];
          const d = haversine(
            current.lat,
            current.lng,
            geo.lat,
            geo.lng
          );
    
          if (d < closestDist) {
            closestDist = d;
            closestId = id;
          }
        }
    
        ordered.push(closestId);
        current = geoMap[closestId];
        remaining.splice(remaining.indexOf(closestId), 1);
      }
    
      // agregar al final los pedidos sin geo
const withoutGeo = route.orders.filter(id => !geoMap[id]);

route.orders = [...ordered, ...withoutGeo];

    }
    
    route.updatedAt = Date.now();

    await env.PEDIDOS_KV.put(routeKey, JSON.stringify(route));

    return json({ route });
  }
}

if (url.pathname === "/api/admin/change-date" && request.method === "POST") {
  const session = getCookie(request, "admin_session");
  if (session !== "ok") {
    return json({ error: "Unauthorized" }, 401);
  }

  const { order_id, date } = await request.json();

  const baseKey = `pedido_base:${order_id}`;
  const base = await env.PEDIDOS_KV.get(baseKey, "json");
  if (!base) {
    return json({ error: "Pedido no encontrado" }, 404);
  }

  const oldDate =
    base.orderDate ||
    new Date(base.createdAt).toISOString().slice(0,10);

  base.orderDate = date;
  await env.PEDIDOS_KV.put(baseKey, JSON.stringify(base));

  const oldKey = `admin:orders_by_date:${oldDate}`;
  const oldList = (await env.PEDIDOS_KV.get(oldKey, "json")) || [];
  await env.PEDIDOS_KV.put(
    oldKey,
    JSON.stringify(oldList.filter(id => id !== order_id))
  );

  const newKey = `admin:orders_by_date:${date}`;
  const newList = (await env.PEDIDOS_KV.get(newKey, "json")) || [];
  newList.unshift(order_id);
  await env.PEDIDOS_KV.put(newKey, JSON.stringify(newList));

  return json({ ok: true });
}

// =====================================================
// ADMIN REPORT (SOLO PEDIDOS ENTREGADOS)
// =====================================================
if (url.pathname === "/api/admin/report" && request.method === "GET") {
  const session = getCookie(request, "admin_session");
  if (session !== "ok") {
    return json({ error: "Unauthorized" }, 401);
  }

  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!from || !to) {
    return json({ error: "Missing dates" }, 400);
  }

  const today = new Date().toISOString().slice(0, 10);

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  // 👉 nunca incluir hoy ni futuro
  const finalTo = to >= today ? yesterday : to;

  if (from > finalTo) {
    return json({
      from,
      to: finalTo,
      total: 0,
      totalPicadas: 0,
      totalEnvios: 0,
      orders: []
    });
  }

  let total = 0;
  let totalEnvios = 0;
  let totalPicadas = 0;
  const orders = [];

  const cursor = new Date(from);

  while (cursor.toISOString().slice(0, 10) <= finalTo) {
    const day = cursor.toISOString().slice(0, 10);
    const key = `admin:orders_by_date:${day}`;

    const ids = (await env.PEDIDOS_KV.get(key, "json")) || [];

    if (!ids.length) {
      cursor.setDate(cursor.getDate() + 1);
      continue;
    }

    for (const id of ids) {
      const [base, confirmed] = await Promise.all([
        env.PEDIDOS_KV.get(`pedido_base:${id}`, "json"),
        env.PEDIDOS_KV.get(`pedido:${id}`, "json")
      ]);

      // ❌ solo pedidos pagos
      if (!base || confirmed?.status !== "confirmed") continue;

      const effectiveDate =
        base.orderDate ||
        new Date(base.createdAt).toISOString().slice(0, 10);

      // ✅ solo pedidos dentro del rango elegido
      if (effectiveDate < from || effectiveDate > finalTo) continue;

      const ENVIO_POR_PICADA = 5000;

      const items = base.items || [];
      const envioVariable = Number(base.envio || 0);

      // 👉 envío variable se suma UNA vez por pedido
      totalEnvios += envioVariable;

      items.forEach((item, index) => {
        const precioPicada = Number(item.price || 0);

        // 🔹 producto neto (sin envío fijo)
        totalPicadas += (precioPicada - ENVIO_POR_PICADA);

        // 🔹 envío fijo por picada
        totalEnvios += ENVIO_POR_PICADA;

        // 🔹 total real cobrado
        total += precioPicada;

        orders.push({
          order_id: id,
          group: items.length > 1,
          picada_index: index + 1,
          name: base.clientName,
          whatsapp: base.clientWhatsapp,
          model: item.model,
          size: item.size,
          amount: precioPicada,
          zone: base.zone || "-",
          address: base.address || "-",
          deliveryTime: base.deliveryTime || null,
          date: effectiveDate
        });
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  // ✅ ÚLTIMO PASO: ordenar por fecha + horario de entrega
  orders.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date); // YYYY-MM-DD
    }
    return deliveryTimeOrder(a.deliveryTime) -
           deliveryTimeOrder(b.deliveryTime);
  });

  return json({
    from,
    to: finalTo,
    total,
    totalPicadas,
    totalEnvios,
    orders
  });
}
    ("Not Found", { status: 404 });
  }
};
