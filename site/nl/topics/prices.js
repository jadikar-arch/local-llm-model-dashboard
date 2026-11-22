// Stub for prices topic
if (!window.Topics) {
  window.Topics = {};
}
window.Topics.prices = (ctx) => {
  const { el } = ctx;
  el.innerHTML = '<div class="empty">Prices: coming soon</div>';
};