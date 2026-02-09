const today = new Date().toISOString().split("T")[0];
document.getElementsByName("setTodaysDate")[0].setAttribute("min", today);

const dropzones = document.querySelectorAll(".dropzone");

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("todos")) || [];
  },
  set(todos) {
    localStorage.setItem("todos", JSON.stringify(todos));
  }
};

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
          <div>${dados.description || ""}</div>
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
  }
};

function closeButton(id) {
  Todo.todos = Todo.todos.filter(task => task.id !== id);
  Storage.set(Todo.todos);
  manipuladorInterface.removeCard(id);
  contadorTarefas();
}

const App = {
  init() {
    Todo.todos = Storage.get();
    Todo.todos.forEach(task => manipuladorInterface.addCard(task));
    contadorTarefas();
  }
};

const Todo = {
  todos: [],

  add(task) {
    this.todos.push(task);
    Storage.set(this.todos);
  },

  update() {
    Storage.set(this.todos);
  }
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
      description: this.description.value
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
  }
};

function formatedDate(dt) {
  const data = new Date(dt);
  return `${data.getDate()}/${data.getMonth() + 1}/${data.getFullYear()}`;
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

  Todo.update();
  contadorTarefas();
}

dropzones.forEach(dropzone => {
  dropzone.addEventListener("dragover", function () {
    this.classList.add("over");
    const card = document.querySelector(".is-dragging");
    if (card) this.appendChild(card);
  });

  dropzone.addEventListener("dragleave", function () {
    this.classList.remove("over");
  });
});

App.init();
