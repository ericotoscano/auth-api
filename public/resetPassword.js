const statusElement = document.getElementById("status");
const form = document.getElementById("reset-form");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (!token) {
  statusElement.innerText = "Invalid reset password link.";
} else {
  form.style.display = "block";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (password.value !== confirmPassword.value) {
      statusElement.innerText = "Passwords do not match.";
      return;
    }

    statusElement.innerText = "Resetting password...";

    try {
      const res = await fetch(
        "http://localhost:3000/api/v1/auth/password/reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: password.value,
            confirm: confirmPassword.value,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw data;

      statusElement.innerText = "Password reset successfully!";
      form.style.display = "none";
    } catch (err) {
      statusElement.innerText =
        err?.feedback || err?.message || "Reset failed or token expired.";
    }
  });
}
