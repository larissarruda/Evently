const logoutBtn = document.getElementById("logout");
const eventBtn = document.getElementById("eventos");
const userToken = localStorage.getItem("tokenAcesso");

/* --------------------------------- Comunicação com REST API --------------------------------- */

// Retorna eventos do usuário logado (antigo getUserEvents)
const getAllEvents = async () => {
  let response = await fetch("/events", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  if (response.status === 200) {
    response = await response.json();
    return response;
  } else {
    console.log(response);
    throw response.error;
  }
};

const getUsernameById = async id => {
  console.log(id)
  let response = await fetch(`/getusernamebyid/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  response = await response.json();
  console.log(response)
  if (response.status === 200) {
    return response
  } else {
    throw response.error;
  }
};

const getIdByUsername = async username => {
  console.log(id)
  let response = await fetch(`/getidbyusername/${username}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  response = await response.json();
  console.log(response)
  if (response.status === 200) {
    return response
  } else {
    throw response.error;
  }
};
// Remover na database
const deleteEvent = async id => {
  let response = await fetch(`/event/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  if (response.status === 200) {
    window.alert("Evento removido com sucesso!");
  }
  return response.error;
};
// Editar na database
const editEvent = async (changes, id) => {
  let response = await fetch(`/event/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    body: changes,
  });
  if (response.status === 200) {
    window.alert("Evento editado com sucesso!");
  } else {
    window.alert(response.error);
  }
};

const getEvent = async id => {
  let response = await fetch(`/event/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  response = await response.json();
  if (response.status === 200) {
    return response.body;
  } else {
    throw response.error;
  }
};

const createEvent = async event => {
  let response = await fetch("/event", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify(event),
  });
  await response.json();
  if (response.status === 201) {
    return true;
  } else {
    window.alert(response.error);
  }
};

const getNotifications = async () => {};

/* --------------------------------- Layout da tabela de eventos --------------------------------- */

// Cria botões para ação
const createButtons = id => {
  const editBtn = document.createElement("button");
  const deleteBtn = document.createElement("button");
  editBtn.innerText = "Editar";
  deleteBtn.innerText = "Excluir";
  editBtn.setAttribute("id", id);
  deleteBtn.setAttribute("id", id);
  editBtn.classList.add("btn-yellow");
  deleteBtn.classList.add("btn-red");
  editBtn.addEventListener("click", e => editRow(e));
  deleteBtn.addEventListener("click", e => deleteRow(e));
  return [editBtn, deleteBtn];
};

const getGuests = async guestArray => {
  /*   return `<span class="${guest.accepted}">${await getUsername(guest._id)}<span/>`; */
  let elements = [];
  guestArray.map(async guest => {
    try {
      let username = await getUsernameById(guest._id);
      elements.push(username);
    } catch (err) {
      console.log(err);
    }
  });
  console.log(elements);
};

// Cria uma row para listagem de eventos
const createRow = async evento => {
  const id = evento._id.toString();
  const newRow = document.createElement("tr");
  let convidados = await getGuests(evento.guests);
  console.log(convidados);
  newRow.innerHTML = `
    <td>${evento.title}</td>
    <td>${evento.description}</td>
    <td> <input disabled type="datetime-local" value="${new Date(Number(evento.start)).toISOString().split(".")[0]}"> </td>
    <td> <input disabled type="datetime-local" value="${new Date(Number(evento.end)).toISOString().split(".")[0]}"> </td>
    <td>${convidados}<td>
    `;
  const [editBtn, deleteBtn] = createButtons(id);
  const espacoBotoes = document.createElement("td");
  espacoBotoes.appendChild(editBtn);
  espacoBotoes.appendChild(deleteBtn);
  newRow.appendChild(espacoBotoes);
  document.querySelector("#tabelaEventos>tbody").appendChild(newRow);
};

// Abrir modal para edição de evento
const editRow = async e => {
  const id = e.target.id;
  try {
    const event = await getEvent(id);
    fillFields(event);
    openModal();
  } catch (err) {
    window.alert(err);
  }
};

// Função ao clicar no botão de excluir
const deleteRow = async e => {
  const id = e.target.id;
  const resp = confirm(`Deseja mesmo excluir este evento?`);
  if (resp) {
    try {
      await deleteEvent(id);
      updateTable();
    } catch (err) {
      window.alert(err);
    }
  }
};

// Removendo todos os itens da tabela
const clearTable = () => {
  const rows = document.querySelectorAll("#tabelaEventos>tbody tr");
  for (let row of rows) {
    row.parentNode.removeChild(row);
  }
};
//antigo saveEvent
const sendEvent = async () => {
  if (isValidFields()) {
    const evento = {
      title: document.getElementById("titulo").value,
      start: document.getElementById("dataInicio").value,
      end: document.getElementById("dataFim").value,
      description: document.getElementById("descricao").value,
      guests: document.getElementById("convidados").value,
    };
    if (evento.guests.includes("@")) {
      const invalidos = [];
      const novosConvidados = [];
      const convidados = evento.guests.replace(/\s+/g, "").split("@");
      for (let convidado of convidados) {
        try {
          convidado = await getUsernameById(convidado);
          novosConvidados.push({ userId: convidado });
        } catch (err) {
          invalidos.push(convidado);
        }
      }
    }
    const index = document.getElementById("titulo").dataset.index;
    if (index == "new") {
      createEvent(evento);
      updateTable();
      closeModal();
    } else {
      editEvent(evento, index);
      updateTable();
      closeModal();
    }
  }
};

// Atualiza tabela com novos valores
const updateTable = async () => {
  try {
    const eventos = await getAllEvents();
    clearTable();
    if (eventos.length > 0) {
      for (let evento of eventos) {
        createRow(evento);
      }
    } else {
      window.alert("Usuário ainda não tem eventos");
    }
  } catch (err) {
    window.alert(err);
  }
};

/* --------------------------------- Modal --------------------------------- */

// Retorna se os campos estão seguindo as regras
const isValidFields = () => {
  return document.getElementById("form").reportValidity();
};

// Preenche modal com dados do evento
const fillFields = evento => {
  document.getElementById("titulo").value = evento.title;
  document.getElementById("descricao").value = evento.description;
  document.getElementById("dataInicio").value = evento.start;
  document.getElementById("dataFim").value = evento.end;
  document.getElementById("convidados").value = evento.guests;
  document.getElementById("titulo").dataset.index = evento.title;
};

// Abre tela de formulário para adicionar/editar eventos
const openModal = () => {
  document.getElementById("modal").classList.add("active");
};

// Fecha a tela de formulário
const closeModal = () => {
  clearFields();
  document.getElementById("modal").classList.remove("active");
};

// Transforma os valores do formulário em uma string vazia
const clearFields = () => {
  const fields = document.querySelectorAll(".modal-field");
  for (let field of fields) {
    field.value = "";
  }
  document.getElementById("titulo").dataset.index = "new";
};

/* --------------------------------- Botões ---------------------------------  */
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("tokenAcesso");
  window.location = "/";
});

eventBtn.addEventListener("click", updateTable);

document.getElementById("cadastrarEvento").addEventListener("click", openModal);

document.getElementById("modalClose").addEventListener("click", closeModal);

document.getElementById("salvar").addEventListener("click", sendEvent);

document.getElementById("cancelar").addEventListener("click", closeModal);

/* Caso usuário não tenha token, redireciona par\a página inicial */
if (!localStorage.getItem("tokenAcesso")) {
  window.location = "/";
}

updateTable();
