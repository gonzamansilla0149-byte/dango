const ADMIN_USER = "dango4545";
const ADMIN_PASS = "4358dango2525";
const ADMIN_TOKEN = "DANGO_ADMIN_TOKEN_2025_SECURE";

export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://dangotools.com",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    // =========================
    // CORS PREFLIGHT
    // =========================
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // =========================
    // ADMIN LOGIN
    // =========================
    if (request.method === "POST" && url.pathname === "/api/admin-login") {

      const body = await request.json();

      if (
        body.username === ADMIN_USER &&
        body.password === ADMIN_PASS
      ) {
        return new Response(JSON.stringify({
          token: ADMIN_TOKEN,
          role: "admin"
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      return new Response(JSON.stringify({
        error: "Credenciales incorrectas"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    // =========================
    // VERIFICAR TOKEN
    // =========================
    function verifyAdmin(request) {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader) return false;

      const token = authHeader.replace("Bearer ", "");
      return token === ADMIN_TOKEN;
    }

    try {

      // =========================
      // GET PRODUCTS
      // =========================
// =========================
// GET PRODUCTS (PÚBLICO)
// =========================
if (request.method === "GET" && url.pathname === "/api/products") {

  const search = url.searchParams.get("search");

  let query = `
    SELECT * FROM products 
    WHERE active = 1
  `;

  if (search) {
    query += `
      AND (
        name LIKE ? OR
        brand LIKE ? OR
        category LIKE ?
      )
    `;
  }

  query += " ORDER BY id DESC";

  let stmt = env.DB.prepare(query);

  if (search) {
    const term = `%${search}%`;
    stmt = stmt.bind(term, term, term);
  }

  const { results } = await stmt.all();

  return new Response(JSON.stringify(results), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

// =========================
// GET PRODUCT BY ID (PÚBLICO)
// =========================
if (request.method === "GET" && url.pathname.startsWith("/api/products/")) {

  const id = url.pathname.split("/").pop();

  const product = await env.DB.prepare(`
    SELECT * FROM products
    WHERE id = ? AND active = 1
  `)
  .bind(id)
  .first();

  return new Response(JSON.stringify(product || {}), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

      // =========================
      // CREATE PRODUCT
      // =========================
      if (request.method === "POST" && url.pathname === "/api/products") {

        if (!verifyAdmin(request)) {
          return new Response("No autorizado", {
            status: 401,
            headers: corsHeaders
          });
        }

        const data = await request.json();

        await env.DB.prepare(`
          INSERT INTO products
          (name, price, description, category, brand, model, stock, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          data.name,
          data.price,
          data.description,
          data.category,
          data.brand,
          data.model || "",
          data.stock,
          data.image_url
        )
        .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      // =========================
      // UPDATE PRODUCT
      // =========================
      if (request.method === "PUT" && url.pathname.startsWith("/api/products/")) {

        if (!verifyAdmin(request)) {
          return new Response("No autorizado", {
            status: 401,
            headers: corsHeaders
          });
        }

        const id = url.pathname.split("/").pop();
        const data = await request.json();

        await env.DB.prepare(`
          UPDATE products
          SET name = ?, brand = ?, price = ?, description = ?, image_url = ?, stock = ?
          WHERE id = ?
        `)
        .bind(
          data.name,
          data.brand,
          data.price,
          data.description,
          data.image_url,
          data.stock,
          id
        )
        .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      // =========================
      // DELETE PRODUCT
      // =========================
      if (request.method === "DELETE" && url.pathname.startsWith("/api/products/")) {

        if (!verifyAdmin(request)) {
          return new Response("No autorizado", {
            status: 401,
            headers: corsHeaders
          });
        }

        const id = url.pathname.split("/").pop();

        await env.DB.prepare(`
          UPDATE products
          SET active = 0
          WHERE id = ?
        `)
        .bind(id)
        .run();

        return new Response(JSON.stringify({ success: true }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      return new Response("Not found", { status: 404 });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
  }
};
