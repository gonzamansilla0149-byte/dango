export default {
  async fetch(request) {
    return new Response("API funcionando 🚀", {
      headers: { "Content-Type": "text/plain" }
    });
  }
};
