const form = document.getElementById("form");
const fields = document.querySelectorAll(".form-field");

const isValidFields = () => {
  return document.getElementById("form").reportValidity();
};

form.addEventListener("submit", async e => {
  e.preventDefault();
  if (isValidFields()) {
    let user = {
      username: fields[0].value,
      password: fields[1].value,
    };
    let response = await fetch("/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    response = await response.json();
    if (response.tokenAcesso) {
      localStorage.setItem("tokenAcesso", response.tokenAcesso);
      window.location = "/home";
    } else {
      window.alert(response.error);
    }
  }
});

if (localStorage.getItem("tokenAcesso")) {
  window.location = "/home";
}
