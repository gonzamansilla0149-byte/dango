document.getElementById('affiliate-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Evita el envío del formulario por defecto

  // Validación del formulario
  const fullName = document.getElementById('full-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const referralSource = document.getElementById('referral-source').value.trim();
  const terms = document.getElementById('terms').checked;

  if (!fullName || !email || !phone || !referralSource || !terms) {
    alert("Por favor, completa todos los campos y acepta los términos.");
    return;
  }

  // Si la validación es exitosa, puedes enviar los datos
  alert("¡Te has registrado como afiliado exitosamente!");

  // Aquí va la lógica para enviar el formulario a tu servidor (por ejemplo, usando fetch)
  // Ejemplo:
  /*
  fetch('/submit-affiliate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fullName,
      email,
      phone,
      referralSource,
      website: document.getElementById('website').value
    })
  }).then(response => {
    if (response.ok) {
      alert('Formulario enviado con éxito');
    } else {
      alert('Error al enviar el formulario');
    }
  });
  */
});
