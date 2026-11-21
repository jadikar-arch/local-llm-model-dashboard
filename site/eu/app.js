// TEMPLATE for site/<country>/app.js. Stub renders are replaced by Topics.<id> as topic files get written.
const stub = (title) => ({ el }) => { el.innerHTML = `<div class="empty">${title}: coming soon</div>`; };
const topic = (id, title) => ({ id, title, render: (ctx) => (window.Topics && Topics[id] ? Topics[id](ctx) : stub(title)(ctx)) });

Kit.mount({
  country: "eu",
  title: "European Union in numbers",
  subtitle: "AI, energy and prices from official Eurostat open data.",
  topics: [topic("ai", "Artificial Intelligence"), topic("renewables", "Renewable Energy"), topic("inflation", "Inflation")],
});