const today = new Date().toISOString().split("T")[0];
document.getElementsByName("setTodaysDate")[0]?.setAttribute("min", today);

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
  }
};

const manipuladorInterface = {
  boardPendente: document.getElementById("pendente"),
  boardAndamento: document.getElementById("andamento"),
  boardFeito: document.getElementById("feito"),

  addCard(dados) {
    const card = document.createElement("div");

    card.id = dados.id;
    card.className = "card";
    card.draggable = true;

    card.innerHTML = `
      <div class="cardContent">
        <div>${dados.responsible} - ${formatedDate(dados.date)}</div>
        <div><strong>${dados.title}</strong></div>
        <div>${dados.description || ""}</div>
      </div>

      <button type="button" class="buttonClose">
        ✕
      </button>
    `;

    // evento fechar
    card.querySelector(".buttonClose").addEventListener("click", () => {
      closeButton(dados.id);
    });

    // drag events
    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);

    if (dados.status === 0) this.boardPendente.appendChild(card);
    if (dados.status === 1) this.boardAndamento.appendChild(card);
    if (dados.status === 2) this.boardFeito.appendChild(card);
  },

  removeCard(id) {
    document.getElementById(id)?.remove();
  },

  clearBoards() {
    dropzones.forEach(zone => zone.innerHTML = "");
  },

  renderTodos() {
    this.clearBoards();
    Todo.todos.forEach(task => this.addCard(task));
  }
};

function closeButton(id) {
  Todo.todos = Todo.todos.filter(task => task.id !== id);
  Storage.set(Todo.todos);
  manipuladorInterface.removeCard(id);
}

const App = {
  init() {
    Todo.todos = Storage.get();
    manipuladorInterface.renderTodos();
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
  }
};

function formatedDate(dt) {
  const data = new Date(dt);
  return `${data.getDate()}/${data.getMonth() + 1}/${data.getFullYear()}`;
}

/* DRAG */

function dragStart() {
  this.classList.add("is-dragging");
}

function dragEnd() {
  this.classList.remove("is-dragging");
}

/* DROP */

dropzones.forEach(dropzone => {

  dropzone.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.classList.add("over");

    const card = document.querySelector(".is-dragging");
    if (card && this !== card.parentElement) {
      this.appendChild(card);
    }
  });

  dropzone.addEventListener("dragleave", function () {
    this.classList.remove("over");
  });

  dropzone.addEventListener("drop", function () {
    this.classList.remove("over");

    const card = document.querySelector(".is-dragging");
    if (!card) return;

    const cardID = card.id;
    const destino = this.id;

    const index = Todo.todos.findIndex(x => x.id === cardID);

    if (index === -1) return;

    if (destino === "pendente") Todo.todos[index].status = 0;
    if (destino === "andamento") Todo.todos[index].status = 1;
    if (destino === "feito") Todo.todos[index].status = 2;

    Todo.update();
  });

});

App.init();
