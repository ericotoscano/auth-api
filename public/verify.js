const statusElement = document.getElementById("status");

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (!token) {
  statusElement.innerText = "Invalid verification link.";
} else {
  fetch("http://localhost:3000/api/v1/auth/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  })
    .then(async (res) => {
      let data = null;

      try {
        data = await res.json();
      } catch {}

      if (!res.ok) throw data;

      return data;
    })
    .then(() => {
      statusElement.innerText = "Your account has been verified successfully!";
    })
    .catch((err) => {
      statusElement.innerText =
        err?.feedback ||
        err?.message ||
        "Verification failed or token expired.";
    });
}
