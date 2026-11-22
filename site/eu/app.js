// TEMPLATE for site/<country>/app.js. Stub renders are replaced by Topics.<id> as topic files get written.
const stub = (title) => ({ el }) => { el.innerHTML = `<div class="empty">${title}: coming soon</div>`; };
const topic = (id, title) => ({ id, title, render: (ctx) => (window.Topics && window.Topics[id] ? window.Topics[id](ctx) : stub(title)(ctx)) });

// Define Topics object to prevent reference errors
if (!window.Topics) {
  window.Topics = {};
}

Kit.mount({
  country: "eu",                       // nl | eu | de  (also the data folder name)
  title: "European Union in numbers", // headline
  subtitle: "AI, renewables and inflation from official Eurostat open data.",
  topics: [topic("ai", "Artificial Intelligence"), topic("renewables", "Renewable Energy"), topic("inflation", "Inflation")],
});