export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://dangotools.com",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Manejo preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    try {

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
// GET PRODUCTO POR ID
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
      // CREAR PRODUCTO
      // =========================
      if (request.method === "POST" && url.pathname === "/api/products") {

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
      // ELIMINAR PRODUCTO
      // =========================
      if (request.method === "DELETE" && url.pathname.startsWith("/api/products/")) {

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
