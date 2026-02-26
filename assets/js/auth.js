const API_URL = "https://dango.gonzamansilla0149.workers.dev";

/* ================= LOGIN ================= */

document.addEventListener("click", async (e) => {

  if (e.target && e.target.id === "login-btn") {

    const email = document.getElementById("login-email")?.value.trim();
    const password = document.getElementById("login-password")?.value.trim();
    const errorBox = document.getElementById("login-error");

    if (!email || !password) {
      errorBox.textContent = "Completa todos los campos";
      return;
    }

    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.error || "Error al iniciar sesión";
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.reload();
  }

});

/* ================= REGISTER ================= */

document.addEventListener("click", async (e) => {

  if (e.target && e.target.id === "register-btn") {

    const name = document.getElementById("register-name")?.value.trim();
    const email = document.getElementById("register-email")?.value.trim();
    const password = document.getElementById("register-password")?.value.trim();
    const confirm = document.getElementById("register-confirm")?.value.trim();
    const errorBox = document.getElementById("register-error");

    if (!name || !email || !password || !confirm) {
      errorBox.textContent = "Completa todos los campos";
      return;
    }

    if (password !== confirm) {
      errorBox.textContent = "Las contraseñas no coinciden";
      return;
    }

    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.error || "Error al registrar";
      return;
    }

    alert("Cuenta creada correctamente 🎉");

    // Auto login opcional
    localStorage.setItem("token", data.token || "");
    
    window.location.reload();
  }

});
