document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("affiliate-form");
  const message = document.getElementById("form-message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const terms = document.getElementById("terms").checked;

    if (!name || !email || !phone || !terms) {
      message.textContent = "Por favor completá todos los campos obligatorios.";
      message.style.color = "#e53935";
      return;
    }

    message.textContent = "¡Registro enviado correctamente!";
    message.style.color = "#0077ff";

    form.reset();
  });

});
