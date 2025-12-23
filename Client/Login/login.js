function login() {
  const mobile = document.getElementById("mobile").value;
  const password = document.getElementById("password").value;

  if (!mobile || !password) {
    alert("Mobile aur Password required");
    return;
  }

  fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, password })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert(data.message || "Login failed");
        return;
      }

      // SAVE TOKEN + ROLE
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // REDIRECT
      if (data.role === "admin") {
        window.location.href = "../Admin/admin.html";
      } else {
        window.location.href = "../User/user.html";
      }
    })
    .catch(() => alert("Server error"));
}
