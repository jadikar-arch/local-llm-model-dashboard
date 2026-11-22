// TEMPLATE for site/<country>/app.js. Stub renders are replaced by Topics.<id> as topic files get written.
const stub = (title) => ({ el }) => { el.innerHTML = `<div class="empty">${title}: coming soon</div>`; };
const topic = (id, title) => ({ id, title, render: (ctx) => (window.Topics && Topics[id] ? Topics[id](ctx) : stub(title)(ctx)) });

// Define Topics object to prevent reference errors
if (!window.Topics) {
  window.Topics = {};
}

Kit.mount({
  country: "nl",                       // nl | eu | de  (also the data folder name)
  title: "The Netherlands in numbers", // headline
  subtitle: "Housing, energy and prices from official CBS open data.",
  topics: [topic("housing", "Housing"), topic("energy", "Energy"), topic("prices", "Prices")],
});