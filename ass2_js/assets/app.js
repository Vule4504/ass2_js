(function () {
  const API = localStorage.getItem("SUSAN_API") || "http://localhost:3000";
  const LS_SESSION = "susan_session_user";
  const cartKey = (uid) => `susan_cart_${uid}`;
  const $ = (s) => document.querySelector(s);
  const fmtVND = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(n || 0));

  async function http(method, path, data) {
    const res = await fetch(API + path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) throw new Error(`${method} ${path} ${res.status}`);
    return res.json();
  }
  const get = (p) =>
    fetch(API + p).then((r) => {
      if (!r.ok) throw new Error(p);
      return r.json();
    });
  const post = (p, d) => http("POST", p, d);
  const patch = (p, d) => http("PATCH", p, d);
  const del = (p) =>
    fetch(API + p, { method: "DELETE" }).then((r) => {
      if (!r.ok) throw new Error("DELETE " + p);
      return true;
    });

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(LS_SESSION));
    } catch {
      return null;
    }
  }
  function setSession(u) {
    if (u)
      localStorage.setItem(
        LS_SESSION,
        JSON.stringify({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role || "user",
        })
      );
    else localStorage.removeItem(LS_SESSION);
  }
  function isLogged() {
    return !!getSession();
  }
  function isAdmin() {
    const s = getSession();
    return s && s.role === "admin";
  }

  async function login(email, pass) {
    const list = await get(
      `/users?email=${encodeURIComponent(email)}&pass=${encodeURIComponent(
        pass
      )}`
    );
    const u = list[0];
    if (!u) throw new Error("Sai email hoặc mật khẩu");
    setSession(u);
    return u;
  }
  async function register(name, email, pass) {
    const ex = await get(`/users?email=${encodeURIComponent(email)}`);
    if (ex.length) {
      throw new Error("Email đã tồn tại");
    }
    const u = await post("/users", { name, email, pass, role: "user" });
    setSession(u);
    return u;
  }

  // ---- Cart (bugfix: only toast when added, not when blocked) ----
  function getCart() {
    const s = getSession();
    if (!s) return [];
    try {
      return JSON.parse(localStorage.getItem(cartKey(s.id))) || [];
    } catch {
      return [];
    }
  }
  function setCart(items) {
    const s = getSession();
    if (!s) return;
    localStorage.setItem(cartKey(s.id), JSON.stringify(items || []));
    updateCartBadge();
  }
  // Normalize pid comparisons by stringifying IDs to avoid number/string mismatch
  function cartAdd(pid, qty = 1) {
    if (!isLogged()) {
      openLogin();
      return;
    }
    const items = getCart();
    const ex = items.find((x) => String(x.pid) === String(pid));
    if (ex) ex.qty += qty;
    else items.push({ pid: String(pid), qty });
    setCart(items);
    toast("Đã thêm vào giỏ");
  }
  function cartUpdate(pid, qty) {
    const items = getCart();
    const it = items.find((x) => String(x.pid) === String(pid));
    if (!it) return;
    it.qty = Math.max(1, qty | 0);
    setCart(items);
  }
  function cartRemove(pid) {
    setCart(getCart().filter((x) => String(x.pid) !== String(pid)));
  }
  function cartClear() {
    setCart([]);
  }
  function cartCount() {
    return getCart().reduce((s, x) => s + Number(x.qty || 0), 0);
  }
  async function cartTotal() {
    const db = await get("/products");
    return getCart().reduce((sum, x) => {
      const p = db.find((i) => String(i.id) === String(x.pid));
      return sum + (p ? p.price * x.qty : 0);
    }, 0);
  }

  async function createOrder(order) {
    return post("/orders", order);
  }

  function renderHeader(active) {
    const s = getSession();
    const badge = `<span id="cartBadge" class="position-absolute translate-middle badge rounded-pill bg-danger badge-cart">0</span>`;
    const adminChip =
      s && s.role === "admin"
        ? '<span class="admin-chip ms-2">Admin</span>'
        : "";
    const nav = `
<nav class="navbar navbar-expand-lg bg-white sticky-top">
  <div class="container">
    <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="index.html">
      <i class="bi bi-bag-heart-fill text-danger"></i> <span>Susan Shop</span>${adminChip}
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain"><span class="navbar-toggler-icon"></span></button>
    <div class="collapse navbar-collapse" id="navMain">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item"><a class="nav-link ${
          active === "home" ? "active" : ""
        }" href="index.html">Trang chủ</a></li>
        <li class="nav-item"><a class="nav-link ${
          active === "products" ? "active" : ""
        }" href="products.html">Sản phẩm</a></li>
        <li class="nav-item"><a class="nav-link ${
          active === "about" ? "active" : ""
        }" href="about.html">Giới thiệu</a></li>
        <li class="nav-item"><a class="nav-link ${
          active === "policy" ? "active" : ""
        }" href="policy.html">Chính sách</a></li>
        <li class="nav-item"><a class="nav-link ${
          active === "contact" ? "active" : ""
        }" href="contact.html">Liên hệ</a></li>
        ${
          isAdmin()
            ? '<li class="nav-item"><a class="nav-link ' +
              (active === "admin" ? "active" : "") +
              '" href="admin.html">Quản trị</a></li>'
            : ""
        }
      </ul>
      <div class="d-flex align-items-center gap-3">
        <div id="authArea" class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-dark btn-sm" data-bs-toggle="modal" data-bs-target="#authModal">
            <i class="bi bi-box-arrow-in-right me-1"></i><span id="authBtnText">${
              s ? "Đăng xuất" : "Đăng nhập"
            }</span>
          </button>
        </div>
        <a class="btn btn-dark position-relative" href="cart.html" title="Giỏ hàng">
          <i class="bi bi-cart3"></i>${badge}
        </a>
      </div>
    </div>
  </div>
</nav>
<!-- Auth Modal -->
<div class="modal fade" id="authModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header"><h5 class="modal-title"><i class="bi bi-person-circle me-2"></i>Tài khoản</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body">
        ${
          s
            ? `
          <div>Xin chào, <strong>${s.name}</strong> (${s.email})</div>
          <div class="mt-3"><button id="btnLogout" class="btn btn-dark w-100">Đăng xuất</button></div>
        `
            : `
        <ul class="nav nav-tabs" role="tablist">
          <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#loginTab" type="button">Đăng nhập</button></li>
          <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#registerTab" type="button">Đăng ký</button></li>
        </ul>
        <div class="tab-content pt-3">
          <div class="tab-pane fade show active" id="loginTab">
            <form id="loginForm" class="vstack gap-2">
              <div><label class="form-label required">Email</label><input id="loginEmail" type="email" class="form-control" required></div>
              <div><label class="form-label required">Mật khẩu</label><input id="loginPass" type="password" class="form-control" required></div>
              <div class="form-text">Admin: admin@susan.vn / 123456</div>
              <button class="btn btn-dark" type="submit">Đăng nhập</button>
            </form>
          </div>
          <div class="tab-pane fade" id="registerTab">
            <form id="registerForm" class="vstack gap-2">
              <div><label class="form-label required">Họ tên</label><input id="regName" class="form-control" required></div>
              <div><label class="form-label required">Email</label><input id="regEmail" type="email" class="form-control" required></div>
              <div><label class="form-label required">Mật khẩu</label><input id="regPass" type="password" class="form-control" minlength="6" required></div>
              <button class="btn btn-danger" type="submit">Đăng ký</button>
            </form>
          </div>
        </div>`
        }
      </div>
    </div>
  </div>
</div>
`;
    const mount = document.getElementById("site-header");
    if (mount) mount.innerHTML = nav;
    if (s) {
      const btn = document.getElementById("btnLogout");
      if (btn)
        btn.addEventListener("click", () => {
          setSession(null);
          location.reload();
        });
    } else {
      const lf = document.getElementById("loginForm");
      const rf = document.getElementById("registerForm");
      if (lf)
        lf.addEventListener("submit", async (e) => {
          e.preventDefault();
          try {
            await login(
              document.getElementById("loginEmail").value.trim().toLowerCase(),
              document.getElementById("loginPass").value
            );
            location.reload();
          } catch (err) {
            alert(err.message || "Đăng nhập thất bại");
          }
        });
      if (rf)
        rf.addEventListener("submit", async (e) => {
          e.preventDefault();
          try {
            await register(
              document.getElementById("regName").value.trim(),
              document.getElementById("regEmail").value.trim().toLowerCase(),
              document.getElementById("regPass").value
            );
            location.reload();
          } catch (err) {
            alert(err.message || "Đăng ký thất bại");
          }
        });
    }
    updateCartBadge();
  }

  function renderFooter() {
    const html = `
<footer class="footer">
  <div class="container">
    <div class="row g-4">
      <div class="col-12 col-md-4"><h6>Susan Shop</h6><p>Hàng công nghệ chính hãng – Uy tín, nhanh chóng, hỗ trợ tận tâm.</p></div>
      <div class="col-6 col-md-2"><h6>Về chúng tôi</h6><ul class="list-unstyled">
        <li><a href="about.html">Giới thiệu</a></li>
        <li><a href="policy.html">Chính sách</a></li>
        <li><a href="contact.html">Liên hệ</a></li></ul></div>
      <div class="col-6 col-md-3"><h6>Hỗ trợ</h6><ul class="list-unstyled">
        <li><a href="policy.html">Bảo hành</a></li>
        <li><a href="policy.html">Đổi trả</a></li>
        <li><a href="policy.html">Vận chuyển</a></li></ul></div>
      <div class="col-12 col-md-3"><h6>Kết nối</h6>
        <div class="d-flex gap-3"><a href="#"><i class="bi bi-facebook"></i></a><a href="#"><i class="bi bi-youtube"></i></a><a href="#"><i class="bi bi-tiktok"></i></a></div>
      </div>
    </div>
    <hr class="border-secondary-subtle my-4"><div class="text-center small">© 2025 Susan Shop. All rights reserved.</div>
  </div>
</footer>`;
    const mount = document.getElementById("site-footer");
    if (mount) mount.innerHTML = html;
  }
  function updateCartBadge() {
    const b = document.getElementById("cartBadge");
    if (b) b.textContent = cartCount();
  }
  function toast(msg) {
    const el = document.createElement("div");
    el.className =
      "toast align-items-center text-bg-dark border-0 position-fixed bottom-0 end-0 m-3";
    el.role = "alert";
    el.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
    document.body.appendChild(el);
    const t = new bootstrap.Toast(el, { delay: 2000 });
    t.show();
    el.addEventListener("hidden.bs.toast", () => el.remove());
  }
  function openLogin() {
    const modal = new bootstrap.Modal(document.getElementById("authModal"));
    modal.show();
  }

  // For admin stats
  async function getSalesSummary() {
    const orders = await get("/orders");
    const products = await get("/products");
    const mapSold = {}; // pid -> qty
    let revenue = 0;
    orders.forEach((o) => {
      o.items.forEach((it) => {
        mapSold[it.pid] = (mapSold[it.pid] || 0) + (it.qty || 0);
        revenue += (it.price || 0) * (it.qty || 0);
      });
    });
    const inventory = products.map((p) => {
      const sold = mapSold[p.id] || 0;
      return {
        id: p.id,
        name: p.name,
        stock: p.stock || 0,
        sold,
        remaining: (p.stock || 0) - sold,
      };
    });
    const countOrdered = Object.values(mapSold).reduce((a, b) => a + b, 0);
    return { countOrdered, revenue, inventory };
  }

  window.SUSAN = {
    API,
    get,
    post,
    patch,
    del,
    getSession,
    setSession,
    isLogged,
    isAdmin,
    login,
    register,
    getCart,
    setCart,
    cartAdd,
    cartUpdate,
    cartRemove,
    cartClear,
    cartCount,
    cartTotal,
    createOrder,
    renderHeader,
    renderFooter,
    fmtVND,
    toast,
    openLogin,
    updateCartBadge,
    getSalesSummary,
  };
})();
