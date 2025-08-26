// Simple store demo (no backend).
// Product data
const PRODUCTS = [
  {id:1, name:'সুন্দর হাতের মেহেদি', price:120, img:'assets/image4.jpg'},
  {id:2, name:'নিখুঁত মেহেদি আর্ট', price:120, img:'assets/2148080076.jpg'},
  {id:3, name:'অর্গানিক ট্রেন্ডি মেহেন্দি', price:120, img:'assets/image2.jpg'},
  {id:4, name:'হাতের জন্য প্রাকৃতিক মেহেন্দি', price:120, img:'assets/2148074857.jpg'},
  {id:5, name:'প্রাকৃতিক মেহেন্দি আর্ট', price:120, img:'assets/2148080096.jpg'},
  {id:6, name:'ন্যাচারাল মেহেন্দি ডিজাইন', price:120, img:'assets/image6.jpg'},
  {id:7, name:'প্রাকৃতিক ফ্যাশনেবল মেহেন্দি', price:120, img:'assets/image1.jpg'},
  {id:8, name:'সাবার নান্দনিক ডিজাইন', price:120, img:'assets/download.png'},
];

const CART_KEY = 'yz_cart_v1';

const qs = s=>document.querySelector(s);
const qsa = s=>Array.from(document.querySelectorAll(s));

function loadCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ return []; }
}
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function addToCart(item, qty=1){
  const cart = loadCart();
  const found = cart.find(i=>i.id===item.id);
  if(found){ found.qty += qty; } else { cart.push({...item, qty}); }
  saveCart(cart);
  updateCartBadge();
}

function removeFromCart(id){
  let cart = loadCart().filter(i=>i.id!==id);
  saveCart(cart); renderCart(); updateCartBadge();
}

function setQty(id, qty){
  qty = Math.max(1, qty|0);
  const cart = loadCart();
  const row = cart.find(i=>i.id===id);
  if(row){ row.qty = qty; saveCart(cart); renderCart(); updateCartBadge(); }
}

function subtotal(){ return loadCart().reduce((s,i)=>s+i.price*i.qty,0); }

function currency(n){ return n.toLocaleString('bn-BD'); }

function updateCartBadge(){
  const count = loadCart().reduce((s,i)=>s+i.qty,0);
  const badge = qs('#cartCount');
  if(badge) badge.textContent = count;
}

// NAV + Drawer
const cartBtn = qs('#cartBtn');
const cartDrawer = qs('#cartDrawer');
const overlay = qs('#overlay');
const closeCart = qs('#closeCart');
if(cartBtn){ cartBtn.onclick = ()=>{ cartDrawer.classList.add('open'); overlay.classList.add('show'); renderCart(); }; }
if(closeCart){ closeCart.onclick = ()=>{ cartDrawer.classList.remove('open'); overlay.classList.remove('show'); }; }
if(overlay){ overlay.onclick = ()=>{ cartDrawer.classList.remove('open'); overlay.classList.remove('show'); hideModal(); }; }

// Render products on index
function renderProducts(){
  const grid = qs('#productGrid');
  if(!grid) return;
  let list = [...PRODUCTS];

  const search = qs('#search');
  const sort = qs('#sort');

  const doRender = ()=>{
    const term = (search?.value || '').toLowerCase();
    let filtered = list.filter(p=>p.name.toLowerCase().includes(term));
    const s = sort?.value;
    if(s==='low') filtered.sort((a,b)=>a.price-b.price);
    else if(s==='high') filtered.sort((a,b)=>b.price-a.price);

    grid.innerHTML = filtered.map(p=>`
      <article class="card product">
        <div class="cover"><img src="${p.img}" alt="${p.name}"/></div>
        <h4>${p.name}</h4>
        <div class="price">
          <strong>৳${currency(p.price)}</strong>
          <div class="qty">
            <button aria-label="Decrease" onclick="changeQty(${p.id}, -1)">-</button>
            <span id="q-${p.id}">1</span>
            <button aria-label="Increase" onclick="changeQty(${p.id}, 1)">+</button>
          </div>
        </div>
        <button class="btn" onclick="addToCartWithQty(${p.id})">Add to Cart</button>
      </article>
    `).join('');
  };
  search?.addEventListener('input', doRender);
  sort?.addEventListener('change', doRender);
  doRender();
}
let qtyMem = {}; // temp qty per product card
function changeQty(id, delta){
  qtyMem[id] = Math.max(1, (qtyMem[id]||1)+delta);
  const el = qs('#q-'+id);
  if(el) el.textContent = qtyMem[id];
}
function addToCartWithQty(id){
  const p = PRODUCTS.find(x=>x.id===id);
  addToCart(p, qtyMem[id]||1);
  qtyMem[id]=1;
  const el = qs('#q-'+id); if(el) el.textContent = 1;
  // open drawer
  if(cartDrawer && overlay){ cartDrawer.classList.add('open'); overlay.classList.add('show'); renderCart(); }
}

// Render cart drawer
function renderCart(){
  const ul = qs('#cartList');
  const sub = qs('#subtotal');
  if(!ul || !sub) return;
  const cart = loadCart();
  ul.innerHTML = cart.length? cart.map(i=>`
    <li class="cart-item">
      <img src="${i.img}"/>
      <div>
        <strong>${i.name}</strong>
        <div class="hint">৳${currency(i.price)} × 
          <input type="number" min="1" value="${i.qty}" style="width:60px" 
            onchange="setQty(${i.id}, this.value)">
        </div>
      </div>
      <div>
        <div>৳${currency(i.price*i.qty)}</div>
        <button class="icon-btn" onclick="removeFromCart(${i.id})">Remove</button>
      </div>
    </li>
  `).join('') : '<p class="hint">কার্ট খালি</p>';
  sub.textContent = currency(subtotal());
  // also update checkout summary subtotal if present
  const sumSub = qs('#sumSubtotal'); if(sumSub) sumSub.textContent = currency(subtotal());
  // refresh summary/payment boxes in case user is on checkout
  if(typeof renderSummary === 'function') try{ renderSummary(); }catch(e){}
  if(typeof renderPaymentBox === 'function') try{ renderPaymentBox(); }catch(e){}
}

// Checkout page logic
function renderSummary(){
  const list = qs('#summaryList');
  const sumSubtotal = qs('#sumSubtotal');
  const grandEl = qs('#grandTotal');
  const shipping = qs('#shipping');
  if(!list || !sumSubtotal || !grandEl || !shipping) return;

  const cart = loadCart();
  list.innerHTML = cart.length? cart.map(i=>`
    <li class="summary-item">
      <img src="${i.img}"/>
      <div>
        <div><strong>${i.name}</strong></div>
        <div class="hint">৳${currency(i.price)} × ${i.qty}</div>
      </div>
      <div><strong>৳${currency(i.price*i.qty)}</strong></div>
    </li>
  `).join('') : '<p class="hint">কার্ট খালি</p>';

  sumSubtotal.textContent = currency(subtotal());

  function updateTotal(){
    const ship = parseInt(shipping.value||0);
    const coupon = (window.__couponDisc||0);
    const total = Math.max(0, subtotal() + ship - coupon);
    grandEl.textContent = currency(total);
  }
  shipping.onchange = updateTotal;
  updateTotal();

  // Apply coupon
  const apply = qs('#applyCoupon');
  const input = qs('#coupon');
  if(apply && input){
    apply.onclick = ()=>{
      const code = (input.value||'').trim().toUpperCase();
      if(code==='YOGA50'){
        window.__couponDisc = 50;
        alert('কুপন প্রয়োগ হয়েছে: ৳50 ছাড়');
      }else if(code==='YOGA100'){
        window.__couponDisc = 100;
        alert('কুপন প্রয়োগ হয়েছে: ৳100 ছাড়');
      }else{
        window.__couponDisc = 0;
        alert('ভ্যালিড কুপন পাওয়া যায়নি');
      }
      updateTotal();
    };
  }
}

// Dynamic Payment Box
function renderPaymentBox(){
  const container = document.getElementById('payContent');
  if(!container) return;

  let method = 'bkash';
  const tabs = qsa('.pay-tab');
  tabs.forEach(t=> t.onclick = ()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    method = t.dataset.method;
    draw();
  });

  function draw(){
    const grand = document.getElementById('grandTotal')?.textContent?.replace(/[,٫]/g,'') || subtotal();
    container.innerHTML = `
      <div class="inline">
        <div>
          <label class="hint">পেমেন্ট মেথড</label>
          <div class="field" style="display:flex;align-items:center;gap:8px">
            <img src="assets/${method}.svg" alt="${method}" style="height:18px">
            <strong style="text-transform:capitalize">${method}</strong>
          </div>
        </div>
        <div>
          <label class="hint">পরিশোধযোগ্য</label>
          <div class="field"><strong>৳ ${grand}</strong></div>
        </div>
      </div>
      <div class="inline">
        <div>
          <label class="hint">মোবাইল নম্বর</label>
          <input id="msisdn" class="field" placeholder="01797850441" />
        </div>
        <div>
          <label class="hint">ট্রানজেকশন আইডি</label>
          <input id="trxid" class="field" placeholder="${method==='bkash'?'BKA':'NAG'}01797850441" />
        </div>
      </div>
      <div>
        <label class="hint">নির্দেশনা</label>
        <ol class="hint">
          <li>${method==='bkash'?'bKash':'Nagad'} অ্যাপ/USSD থেকে <strong>Send Money</strong> করুন নম্বর: <strong>01797850441</strong></li>
          <li>পরিমাণ ও রেফারেন্সে <strong>Order</strong> লিখুন</li>
          <li>ট্রানজেকশন আইডি এখানে লিখুন</li>
        </ol>
      </div>
    `;
  }
  draw();

  // Place order
  const placeBtn = document.getElementById('placeOrder');
  placeBtn.onclick = ()=>{
    const msisdn = document.getElementById('msisdn')?.value?.trim()||'';
    const trx = document.getElementById('trxid')?.value?.trim()||'';
    if(!/^01[0-9]{9}$/.test(msisdn)){
      alert('সঠিক মোবাইল নম্বর দিন (১১ সংখ্যা)'); return;
    }
    if(trx.length < 6){
      alert('ট্রানজেকশন আইডি সঠিকভাবে লিখুন'); return;
    }
    // Demo: create order id, clear cart
    const oid = 'YZ' + Math.random().toString(36).slice(2,8).toUpperCase();
    const name = document.getElementById('c_name')?.value||'';
    const phone = document.getElementById('c_phone')?.value||'';
    const email = document.getElementById('c_email')?.value||'';
    const city = document.getElementById('c_city')?.value||'';
    const address = document.getElementById('c_address')?.value||'';
    const note = document.getElementById('c_note')?.value||'';
    const items = loadCart().map(i=>{
      const p = PRODUCTS.find(pp=>pp.id===i.id);
      return {id:p.id, name:p.name, qty:i.qty, price:p.price, total:p.price*i.qty};
    });
    const payload = {
      project: "Mehendi by Saba",
      orderId: oid,
      method,
      msisdn,
      trxid: trx,
      total: document.getElementById('grandTotal')?.textContent||'',
      customer: {name, phone, email, city, address, note},
      items,
      createdAt: new Date().toISOString()
    };
    if(window.sendOrderToSheet) sendOrderToSheet(payload);

    localStorage.removeItem(''+CART_KEY);
    updateCartBadge();
    showModal(oid);
  };
}

// Modal helpers
function showModal(orderId){
  const m = document.getElementById('successModal');
  const o = document.getElementById('overlay');
  const t = document.getElementById('orderId');
  if(t) t.textContent = orderId;
  if(m && o){ m.classList.add('show'); o.classList.add('show'); }
}
function hideModal(){
  const m = document.getElementById('successModal');
  if(m) m.classList.remove('show');
}

function boot(){
  updateCartBadge();
  renderProducts();
  renderCart();
  renderSummary();
  renderPaymentBox();
}
document.addEventListener('DOMContentLoaded', boot);

