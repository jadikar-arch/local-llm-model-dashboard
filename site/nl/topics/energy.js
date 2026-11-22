// Stub for energy topic
if (!window.Topics) {
  window.Topics = {};
}
window.Topics.energy = (ctx) => {
  const { el } = ctx;
  el.innerHTML = '<div class="empty">Energy: coming soon</div>';
};