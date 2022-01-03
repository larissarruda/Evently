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
    let response = await fetch("/register", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (response.status === 200) {
      window.location = "/";
    } else {
      window.alert(response.error);
    }
  }
});
