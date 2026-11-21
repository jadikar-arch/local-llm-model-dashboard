// TEMPLATE for site/<country>/app.js. Stub renders are replaced by Topics.<id> as topic files get written.
const stub = (title) => ({ el }) => { el.innerHTML = `<div class="empty">${title}: coming soon</div>`; };
const topic = (id, title) => ({ id, title, render: (ctx) => (window.Topics && Topics[id] ? Topics[id](ctx) : stub(title)(ctx)) });

Kit.mount({
  country: "de",                       // nl | eu | de  (also the data folder name)
  title: "Germany in numbers", // headline
  subtitle: "Cars, energy and prices from official Destatis open data.",
  topics: [topic("cars", "Cars"), topic("energy", "Energy"), topic("prices", "Prices")],
});