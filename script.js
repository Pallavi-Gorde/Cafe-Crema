// Café Crema — Nocturne Edition. All data stored in browser localStorage (demo).
const ADMIN = { user: "crema_admin", pass: "Crema@2026" };
const MENU = [
  { id: 1, name: "Signature Double Espresso", cat: "Coffee & Brews", price: 180, img: "espresso_crema.jpg", desc: "Estate beans, thick golden crema." },
  { id: 2, name: "Sea Salt Caramel Iced Latte", cat: "Coffee & Brews", price: 260, img: "caramel_latte.jpg", desc: "House caramel, flaky sea salt, cold milk." },
  { id: 3, name: "18-Hour Nitro Cold Brew", cat: "Coffee & Brews", price: 280, img: "cold_brew.jpg", desc: "Slow-steeped, velvety nitrogen cascade." },
  { id: 4, name: "Lotus Biscoff Frappe", cat: "Coffee & Brews", price: 320, img: "biscoff_frappe.jpg", desc: "Speculoos cream, biscuit crumble." },
  { id: 5, name: "Truffle Cheese Nachos", cat: "Small Plates", price: 390, img: "truffle_nachos.jpg", desc: "Cheese sauce, jalapeño, truffle shavings." },
  { id: 6, name: "Wood-Fired Burrata Pizza", cat: "Mains & Pizza", price: 650, img: "burrata_pizza.jpg", desc: "San Marzano, fresh burrata, basil." },
  { id: 7, name: "Truffle Mushroom Fettuccine", cat: "Mains & Pizza", price: 520, img: "truffle_pasta.jpg", desc: "Handmade pasta, wild mushrooms, parmesan." },
  { id: 8, name: "Cheesy Butter Chicken & Naan", cat: "Mains & Pizza", price: 560, img: "butter_chicken.jpg", desc: "Our signature, with garlic naan." },
  { id: 9, name: "Crema Espresso Tiramisu", cat: "Desserts", price: 340, img: "crema_tiramisu.jpg", desc: "Mascarpone, house espresso, cocoa." },
  { id: 10, name: "Basque Burnt Cheesecake", cat: "Desserts", price: 360, img: "burnt_cheesecake.jpg", desc: "Caramelised top, berry compote." },
];
const $ = (s) => document.querySelector(s);
const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const load = (k, d) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
let bag = load("noir_bag", []);
let orders = load("noir_orders", []);
let bookings = load("noir_bookings", []);

function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); setTimeout(() => el.classList.remove("on"), 2200); }

/* Menu */
const cats = ["All", ...new Set(MENU.map((m) => m.cat))];
$("#filters").innerHTML = cats.map((c, i) => `<button class="${i ? "" : "on"}" data-c="${c}">${c}</button>`).join("");
$("#filters").onclick = (e) => {
  if (!e.target.dataset.c) return;
  document.querySelectorAll("#filters button").forEach((b) => b.classList.toggle("on", b === e.target));
  renderMenu(e.target.dataset.c);
};
function renderMenu(c = "All") {
  $("#menuGrid").innerHTML = MENU.filter((m) => c === "All" || m.cat === c).map((m) => `
    <div class="card"><img src="${m.img}" alt="${m.name}" loading="lazy"><div class="body">
    <h3>${m.name}</h3><p>${m.desc}</p><div class="row"><span class="price">${inr(m.price)}</span>
    <button class="add" data-id="${m.id}">+ Add</button></div></div></div>`).join("");
}
$("#menuGrid").onclick = (e) => { const id = +e.target.dataset.id; if (id) addToBag(id); };

/* Bag */
function addToBag(id) { const r = bag.find((b) => b.id === id); r ? r.qty++ : bag.push({ id, qty: 1 }); save("noir_bag", bag); renderBag(); toast("Added to bag"); }
function renderBag() {
  $("#bagCount").textContent = bag.reduce((s, b) => s + b.qty, 0);
  const sub = bag.reduce((s, b) => s + MENU.find((m) => m.id === b.id).price * b.qty, 0);
  $("#bagItems").innerHTML = bag.length ? bag.map((b) => { const m = MENU.find((x) => x.id === b.id);
    return `<div class="bag-row"><img src="${m.img}" alt=""><div>${m.name}<br><small>${inr(m.price)}</small></div>
    <span class="qty"><button data-d="${b.id}">−</button> ${b.qty} <button data-i="${b.id}">+</button></span></div>`; }).join("") : `<p class="empty">Your bag is empty.</p>`;
  $("#sub").textContent = inr(sub); $("#gst").textContent = inr(sub * 0.05); $("#total").textContent = inr(sub * 1.05);
}
$("#bagItems").onclick = (e) => {
  const i = +e.target.dataset.i, d = +e.target.dataset.d;
  if (i) bag.find((b) => b.id === i).qty++;
  if (d) { const r = bag.find((b) => b.id === d); r.qty--; if (!r.qty) bag = bag.filter((b) => b !== r); }
  save("noir_bag", bag); renderBag();
};
$("#placeOrder").onclick = () => {
  if (!bag.length) return toast("Bag is empty");
  const sub = bag.reduce((s, b) => s + MENU.find((m) => m.id === b.id).price * b.qty, 0);
  orders.unshift({ id: "CR" + Date.now().toString().slice(-5), who: $("#tableNo").value || "Walk-in", items: bag.map((b) => MENU.find((m) => m.id === b.id).name + " ×" + b.qty).join(", "), total: sub * 1.05, status: "New", time: new Date().toLocaleTimeString() });
  save("noir_orders", orders); bag = []; save("noir_bag", bag); renderBag(); closeAll(); toast("Order placed! Brewing now ☕");
};

/* Drawer & nav */
const openDrawer = () => { $("#drawer").classList.add("open"); $("#overlay").classList.add("on"); };
function closeAll() { $("#drawer").classList.remove("open"); $("#overlay").classList.remove("on"); }
$("#bagBtn").onclick = openDrawer; $("#overlay").onclick = closeAll;
$("#burger").onclick = () => $("#navLinks").classList.toggle("open");
document.querySelectorAll("#navLinks a").forEach((a) => (a.onclick = () => $("#navLinks").classList.remove("open")));
document.addEventListener("click", (e) => { const c = e.target.dataset.close; if (c === "drawer") closeAll(); if (c === "staffModal") $("#staffModal").classList.remove("on"); });

/* Reservation */
$("#reserveForm").onsubmit = (e) => {
  e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
  bookings.unshift({ ...f, created: new Date().toLocaleString() }); save("noir_bookings", bookings);
  $("#reserveMsg").textContent = `Thank you ${f.name}! Your table for ${f.guests} on ${f.date} at ${f.time} is confirmed.`; e.target.reset();
};

/* Staff portal */
$("#staffBtn").onclick = () => { $("#staffModal").classList.add("on"); sessionStorage.getItem("noir_auth") ? showDash() : showLogin(); };
function showLogin() { $("#loginBox").style.display = "block"; $("#dash").style.display = "none"; }
function showDash() { $("#loginBox").style.display = "none"; $("#dash").style.display = "block"; renderDash(); }
$("#loginForm").onsubmit = (e) => {
  e.preventDefault();
  if ($("#user").value.trim() === ADMIN.user && $("#pass").value === ADMIN.pass) { sessionStorage.setItem("noir_auth", "1"); $("#loginMsg").textContent = ""; showDash(); }
  else $("#loginMsg").textContent = "Invalid username or password.";
};
$("#logout").onclick = () => { sessionStorage.removeItem("noir_auth"); showLogin(); };
document.querySelectorAll(".tabs button").forEach((b) => (b.onclick = () => {
  document.querySelectorAll(".tabs button,.tab").forEach((x) => x.classList.remove("on"));
  b.classList.add("on"); $("#" + b.dataset.tab).classList.add("on");
}));
function renderDash() {
  const sales = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
  $("#kSales").textContent = inr(sales);
  $("#kActive").textContent = orders.filter((o) => o.status === "New" || o.status === "Brewing").length;
  $("#kBook").textContent = bookings.length; $("#kItems").textContent = MENU.length;
  $("#tOrders").innerHTML = orders.length ? `<table><tr><th>#</th><th>Guest</th><th>Items</th><th>Total</th><th>Time</th><th>Status</th></tr>${orders.map((o, i) => `
    <tr><td>${o.id}</td><td>${o.who}</td><td>${o.items}</td><td>${inr(o.total)}</td><td>${o.time}</td>
    <td><span class="st ${o.status}">${o.status}</span> <select data-o="${i}">${["New", "Brewing", "Served", "Cancelled"].map((s) => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select></td></tr>`).join("")}</table>` : `<p class="empty">No orders yet. Try “Inject Demo Activity”.</p>`;
  $("#tBook").innerHTML = bookings.length ? `<table><tr><th>Guest</th><th>Phone</th><th>Date</th><th>Time</th><th>Party</th><th>Seating</th></tr>${bookings.map((b) => `<tr><td>${b.name}</td><td>${b.phone}</td><td>${b.date}</td><td>${b.time}</td><td>${b.guests}</td><td>${b.seating}</td></tr>`).join("")}</table>` : `<p class="empty">No bookings yet.</p>`;
  $("#tCat").innerHTML = `<table><tr><th></th><th>Item</th><th>Category</th><th>Price</th></tr>${MENU.map((m) => `<tr><td><img src="${m.img}" style="width:44px;height:44px;border-radius:8px;object-fit:cover"></td><td>${m.name}</td><td>${m.cat}</td><td>${inr(m.price)}</td></tr>`).join("")}</table>`;
}
$("#tOrders").onchange = (e) => { const i = e.target.dataset.o; if (i !== undefined) { orders[i].status = e.target.value; save("noir_orders", orders); renderDash(); } };
$("#inject").onclick = () => {
  const names = ["Rohan M.", "Table 4", "Priya S.", "Table 9", "Aarav K."];
  const pick = MENU.sort(() => 0.5 - Math.random()).slice(0, 2); MENU.sort((a, b) => a.id - b.id);
  orders.unshift({ id: "CR" + Date.now().toString().slice(-5), who: names[Math.floor(Math.random() * 5)], items: pick.map((p) => p.name + " ×1").join(", "), total: pick.reduce((s, p) => s + p.price, 0) * 1.05, status: "New", time: new Date().toLocaleTimeString() });
  bookings.unshift({ name: names[Math.floor(Math.random() * 5)], phone: "98200 1" + Math.floor(1000 + Math.random() * 8999), date: new Date().toISOString().slice(0, 10), time: "21:30", guests: "4 Guests", seating: "Lounge Sofa" });
  save("noir_orders", orders); save("noir_bookings", bookings); renderDash(); toast("Demo activity added");
};

renderMenu(); renderBag();
