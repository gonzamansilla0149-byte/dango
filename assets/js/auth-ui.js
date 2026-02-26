function initAuthUI() {

  const authHTML = `
    <div class="auth-overlay" id="auth-overlay">

      <div class="auth-modal" id="login-modal">
        <span class="auth-close">✕</span>
        <h2>Iniciar sesión</h2>
        <div id="login-error" class="auth-error"></div>
        <input type="email" id="login-email" placeholder="Email">
        <input type="password" id="login-password" placeholder="Contraseña">
        <button id="login-btn">Ingresar</button>
        <p>
          ¿No tienes cuenta?
          <span id="open-register-modal" class="auth-link">Crear cuenta</span>
        </p>
      </div>

      <div class="auth-modal" id="register-modal" style="display:none;">
        <span class="auth-close">✕</span>
        <h2>Crear cuenta</h2>
        <div id="register-error" class="auth-error"></div>
        <input type="text" id="register-name" placeholder="Nombre completo">
        <input type="email" id="register-email" placeholder="Email">
        <input type="password" id="register-password" placeholder="Contraseña">
        <input type="password" id="register-confirm" placeholder="Confirmar contraseña">
        <button id="register-btn">Crear cuenta</button>
        <p>
          ¿Ya tienes cuenta?
          <span id="open-login-modal" class="auth-link">Iniciar sesión</span>
        </p>
      </div>

    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", authHTML);

  const overlay = document.getElementById("auth-overlay");
  const loginModal = document.getElementById("login-modal");
  const registerModal = document.getElementById("register-modal");

  function openLogin() {
    overlay.classList.add("active");
    loginModal.style.display = "flex";
    registerModal.style.display = "none";
    document.body.classList.add("no-scroll");
  }

  function openRegister() {
    overlay.classList.add("active");
    registerModal.style.display = "flex";
    loginModal.style.display = "none";
    document.body.classList.add("no-scroll");
  }

  function closeModals() {
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }

  document.getElementById("open-login")?.addEventListener("click", openLogin);
  document.getElementById("open-register")?.addEventListener("click", openRegister);

  document.getElementById("open-register-modal")?.addEventListener("click", openRegister);
  document.getElementById("open-login-modal")?.addEventListener("click", openLogin);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModals();
  });

  document.querySelectorAll(".auth-close").forEach(btn => {
    btn.addEventListener("click", closeModals);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModals();
  });

}

document.addEventListener("DOMContentLoaded", initAuthUI);
