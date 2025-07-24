$(() => {
  const views = {
    login: () => `
      <h4 class="mb-3 text-center">Login</h4>
      <form id="loginForm">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" name="email" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input type="password" class="form-control" name="password" required>
        </div>
        <button type="submit" class="btn btn-primary w-100">Login</button>
        <p class="mt-3 text-center">Belum punya akun? 
          <a href="#" id="toRegister" class="text-decoration-none">Daftar</a>
        </p>
      </form>
    `,
    register: () => `
      <h4 class="mb-3 text-center">Register</h4>
      <form id="registerForm">
        <div class="mb-3">
          <label class="form-label">Nama Lengkap</label>
          <input type="text" class="form-control" name="name" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" name="email" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input type="password" class="form-control" name="password" required>
        </div>
        <button type="submit" class="btn btn-success w-100">Daftar</button>
        <p class="mt-3 text-center">Sudah punya akun? 
          <a href="#" id="toLogin" class="text-decoration-none">Login</a>
        </p>
      </form>
    `
  };

  // Tampilkan login sebagai tampilan default
  $("#form-content").html(views.login());

  // Event Delegasi: navigasi antar form (tanpa reload, tanpa ganti URL)
  $(document).on("click", "#toRegister", e => {
    e.preventDefault();
    $("#form-content").html(views.register());
  });

  $(document).on("click", "#toLogin", e => {
    e.preventDefault();
    $("#form-content").html(views.login());
  });

  // Submit Login
  $(document).on("submit", "#loginForm", e => {
    e.preventDefault();
    const data = $(e.target).serializeArray();
    console.log("Login:", data);
    alert("Login sukses (simulasi)");
  });

  // Submit Register
  $(document).on("submit", "#registerForm", e => {
    e.preventDefault();
    const data = $(e.target).serializeArray();
    console.log("Register:", data);
    alert("Registrasi sukses (simulasi)");

    // Kembali ke login (tanpa ubah URL)
    $("#form-content").html(views.login());
  });
});
