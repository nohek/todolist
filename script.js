const today = new Date().toISOString().split("T")[0];
document.getElementsByName("setTodaysDate")[0].setAttribute("min", today);

const dropzones = document.querySelectorAll(".dropzone");

const postTodos = async (data) => {
  try {
    const response = await fetch("http://localhost:3000/todos/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.log("Erro ao salvar");
  }
};

function putTodos(data) {
  fetch(`http://localhost:3000/todos/${data.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

function deleteTodos(id) {
  fetch(`http://localhost:3000/todos/${id}`, { method: "DELETE" });
}

const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const manipuladorInterface = {
  boardPendente: document.getElementById("pendente"),
  boardAndamento: document.getElementById("andamento"),
  boardFeito: document.getElementById("feito"),

  addCard(dados) {
    const card = document.createElement("div");

    card.innerHTML = `
      <div id="${dados.id}" class="card" draggable="true">
        <div class="ohno">
          <div>${dados.responsible} - ${formatedDate(dados.date)}</div>
          <div>${dados.title}</div>
          <div>${dados.description}</div>
        </div>
        <button type="button" class="buttonClose" onclick="closeButton('${dados.id}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);

    if (dados.status === 0) this.boardPendente.appendChild(card);
    if (dados.status === 1) this.boardAndamento.appendChild(card);
    if (dados.status === 2) this.boardFeito.appendChild(card);
  },

  removeCard(id) {
    document.getElementById(id)?.remove();
  },
};

function closeButton(id) {
  deleteTodos(id);
  manipuladorInterface.removeCard(id);
  contadorTarefas();
}

const App = {
  init() {
    fetch("http://localhost:3000/todos/")
      .then((response) => response.json())
      .then((data) => {
        Todo.todos = data;
        data.forEach((item) => manipuladorInterface.addCard(item));
        contadorTarefas();
      });
  },
};

const Todo = {
  todos: [],
  add(task) {
    postTodos(task);
  },
};

const newTask = {
  responsible: document.querySelector("#responsible"),
  title: document.querySelector("#title"),
  date: document.querySelector("#date"),
  description: document.querySelector("#description"),

  getValues() {
    return {
      responsible: this.responsible.value,
      date: this.date.value,
      title: this.title.value,
      description: this.description.value,
    };
  },

  validateFields() {
    if (!this.responsible.value || !this.date.value || !this.title.value) {
      toastr.info("Preencha os campos obrigatórios");
      return false;
    }
    return true;
  },

  clearFields() {
    this.responsible.value = "";
    this.date.value = "";
    this.title.value = "";
    this.description.value = "";
  },

  submit(event) {
    event.preventDefault();

    if (!this.validateFields()) return;

    const data = this.getValues();
    data.status = 0;
    data.id = uuid.v4();

    Todo.add(data);
    manipuladorInterface.addCard(data);
    Modal.close();
    this.clearFields();
    contadorTarefas();
  },
};

function formatedDate(dt) {
  const data = new Date(dt);
  return `${data.getDate()}/${data.getMonth()+1}/${data.getFullYear()}`;
}

function dragStart() {
  dropzones.forEach(d => d.classList.add("highlight"));
  this.classList.add("is-dragging");
}

function dragEnd(e) {
  dropzones.forEach(d => d.classList.remove("highlight"));
  this.classList.remove("is-dragging");

  const cardID = e.target.id;
  const destino = e.target.parentElement.id;
  const index = Todo.todos.findIndex(x => x.id === cardID);

  if (destino === "pendente") Todo.todos[index].status = 0;
  if (destino === "andamento") Todo.todos[index].status = 1;
  if (destino === "feito") Todo.todos[index].status = 2;

  putTodos(Todo.todos[index]);
  contadorTarefas();
}

dropzones.forEach(dropzone => {
  dropzone.addEventListener("dragover", function() {
    this.classList.add("over");
    const card = document.querySelector(".is-dragging");
    if (card) this.appendChild(card);
  });

  dropzone.addEventListener("dragleave", function() {
    this.classList.remove("over");
  });
});

App.init();
