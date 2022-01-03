const logout = document.getElementById("logout");

// Retorna database
const getEvently = () => {
  let db = JSON.parse(localStorage.getItem("evently"));
  if (db) return db;
  else {
    return {
      userId: null,
      users: [],
    };
  }
};
// Define uma variável global com o id do usuário logado
const userId = getEvently().userId;

// Retorna eventos do usuário logal
const getUserEvents = () => {
  let usuarios = getEvently().users;
  console.log(usuarios);
  if (usuarios) {
    console.log(userId);
    let user = usuarios.find(user => user.id === userId);
    return user.eventos;
  } else {
    return [];
  }
}; // Pode ser substituído por um get request com header de autorização
// Caso evently (db) seja undefined ou null retorna uma array vazia

// Redefine os valores da database com novos valores
const setEvently = newEvently => {
  console.log(newEvently);
  localStorage.setItem("evently", JSON.stringify(newEvently));
}; // Pode ser substituído por um post request usando o parametro newEvently como body e uma autorização como header

// Cria um objeto de evento e os adicionam à database
const createEvent = evento => {
  let novoEvento = evento;
  let db = getEvently();
  let usuario = db.users.find(user => user.id === userId);
  const id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(); // Criando id usando api window.crypto, referencia: https://developer.mozilla.org/pt-BR/docs/Web/API/crypto_property
  novoEvento.id = id; // Define a propriedade id do objeto como um id único, com o objetivo de encontrá=lo para edição e remoção do mesmo
  usuario.eventos.push(novoEvento);
  setEvently(db);
};
// Encontra o evento, o remove da array de eventos do usuário e atualiza a database
const deleteEvent = eventId => {
  let db = getEvently();
  let event = getUserEvents().find(event => event.id === eventId); // Encontrar evento com mesmo id passado à função
  if (event) {
    let user = db.users.find(user => user.id === userId);
    user.eventos.splice(user.eventos.indexOf(event), 1);
    setEvently(db);
  }
};
// "Desloga" o usário e o redireciona para a tela de login
logout.addEventListener("click", () => {
  let db = getEvently();
  db.userId = null;
  setEvently(db);
  window.location = "../index.html";
});

// INTERFACE

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

// Cria uma row para listagem de eventos
const createRow = (evento, id) => {
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
  <td>${evento.titulo}</td>
  <td>${evento.descricao}</td>
  <td>${evento.dataInicio}</td>
  <td>${evento.dataFim}</td>
  <td>${evento.convidados}</td>
  <td>
  <button type="button" class="btn-yellow" id="edit-${id}">Editar</button>
  <button type="button" class="btn-red" id="delete-${id}" >Excluir</button>
  </td>
  `;
  document.querySelector("#tabelaEventos>tbody").appendChild(newRow);
};

// Preenche formulário com dados do evento
const fillFields = evento => {
  document.getElementById("titulo").value = evento.title;
  document.getElementById("descricao").value = evento.description;
  document.getElementById("dataInicio").value = evento.start;
  document.getElementById("dataFim").value = evento.end;
  document.getElementById("convidados").value = evento.guests;
  document.getElementById("titulo").dataset.index = evento.title;
};

// Remove todas as rows da tabela
const clearTable = () => {
  const rows = document.querySelectorAll("#tabelaEventos>tbody tr");
  for (let row of rows) {
    row.parentNode.removeChild(row);
  }
};

// Atualiza tabela com novos valores
const updateTable = () => {
  const eventos = getUserEvents();
  clearTable();
  for (let evento of eventos) {
    createRow(evento, evento.id);
  }
};
// Callback function onclick do botão de salvar.
const saveEvent = () => {
  if (isValidFields()) {
    const Evento = {
      title: document.getElementById("titulo").value,
      start: document.getElementById("dataInicio").value,
      end: document.getElementById("dataFim").value,
      description: document.getElementById("descricao").value,
      guests: document.getElementById("convidados").value,
    };
    const index = document.getElementById("titulo").dataset.index;
    if (index == "new") {
      createEvent(Evento);
      updateTable();
      closeModal();
    } else {
      setEvent(index, Evento);
      updateTable();
      closeModal();
    }
  }
};
// Redefine os valores do evento para novos
const setEvent = (id, newEvent) => {
  let db = getEvently();
  let event = getUserEvents().find(event => event.id === id);
  let user = db.users.find(user => user.id === userId);
  user.eventos.splice(user.eventos.indexOf(event), 1, newEvent);
  setEvently(db);
};

// Inicia o processo de edição de um evento
const editEvent = id => {
  let event = getUserEvents().find(event => event.id === id); // Encontrar evento com mesmo id passado à função
  fillFields(event);
  openModal();
};
// Define ações dos botões de editar/excluir
const editDelete = event => {
  if (event.target.type == "button") {
    const [action, id] = event.target.id.split("-");
    if (action === "edit") {
      editEvent(id);
    } else {
      const evento = getUserEvents().find(event => event.id === id);
      const resp = confirm(`Deseja excluir o evento ${evento.titulo}?`);
      if (resp) {
        deleteEvent(id);
        updateTable();
      }
    }
  }
};

// Retorna se os campos estão seguindo as regras
const isValidFields = () => {
  return document.getElementById("form").reportValidity();
};

// Eventos

document.getElementById("cadastrarEvento").addEventListener("click", openModal);

document.getElementById("modalClose").addEventListener("click", closeModal);

document.getElementById("salvar").addEventListener("click", saveEvent);

document.querySelector("#tabelaEventos>tbody").addEventListener("click", editDelete);

document.getElementById("cancelar").addEventListener("click", closeModal);

/* if (!getEvently().userId) {
  window.location = "../index.html";
} */
updateTable();
