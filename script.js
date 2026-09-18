const STORAGE_KEY = "todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const countLabel = document.getElementById("todo-count");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed-btn");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
  list.innerHTML = "";

  const filtered = todos
    .filter((todo) => {
      if (currentFilter === "active") return !todo.completed;
      if (currentFilter === "completed") return todo.completed;
      return true;
    })
    .sort((a, b) => a.completed - b.completed);

  if (filtered.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = "오늘 할 일을 추가해 보세요 ✏️";
    list.appendChild(emptyMessage);
  }

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleComplete(todo.id));

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;
    text.addEventListener("dblclick", () => startEdit(li, todo));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.type = "button";
    deleteBtn.textContent = "삭제";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

  const remaining = todos.filter((todo) => !todo.completed).length;
  countLabel.textContent = `${remaining}개 남음`;
}

function addTodo(text) {
  todos.push({
    id: Date.now().toString(),
    text,
    completed: false,
  });
  saveTodos();
  render();
}

function toggleComplete(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

function editTodo(id, newText) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  const trimmed = newText.trim();
  if (trimmed) {
    todo.text = trimmed;
  }
  saveTodos();
  render();
}

function startEdit(li, todo) {
  li.innerHTML = "";

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "todo-edit-input";
  editInput.value = todo.text;

  const finish = () => editTodo(todo.id, editInput.value);

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      finish();
    } else if (e.key === "Escape") {
      render();
    }
  });
  editInput.addEventListener("blur", finish);

  li.appendChild(editInput);
  editInput.focus();
  editInput.select();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = "";
  input.focus();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearCompletedBtn.addEventListener("click", () => {
  if (confirm("완료된 항목을 모두 삭제할까요?")) {
    clearCompleted();
  }
});

render();
