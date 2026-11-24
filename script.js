"use strict";

/* ============ Lógica de negocio (igual que en Python) ============ */
const ESTADOS = {
  superior: { texto: "Superior", clase: "superior" },
  alto: { texto: "Alto", clase: "alto" },
  regular: { texto: "Regular", clase: "regular" },
  bajo: { texto: "Bajo", clase: "bajo" },
  perdio: { texto: "Perdió el año!", clase: "perdio" },
};

function obtenerEstado(nota) {
  if (nota >= 4.8) return ESTADOS.superior;
  if (nota >= 4.0) return ESTADOS.alto;
  if (nota >= 3.5) return ESTADOS.regular;
  if (nota >= 3.0) return ESTADOS.bajo;
  return ESTADOS.perdio;
}

/* ============ Referencias al DOM ============ */
const $ = (id) => document.getElementById(id);

const form = $("formNota");
const inputNombre = $("nombre");
const inputNota = $("nota");
const errorBox = $("error");
const previewBadge = $("previewBadge");

const tbody = $("tbody");
const tableWrap = $("tableWrap");
const emptyBox = $("empty");
const resumenTexto = $("resumenTexto");
const btnLimpiar = $("btnLimpiar");
const distribution = $("distribution");
const distBars = $("distBars");

const statTotal = $("statTotal");
const statPromedio = $("statPromedio");
const statMax = $("statMax");
const statMin = $("statMin");

/* ============ Estado + persistencia ============ */
const STORAGE_KEY = "sistema-notas:estudiantes";
let estudiantes = cargar();

function cargar() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function guardar() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estudiantes));
  } catch {
    /* Si el almacenamiento no está disponible, la app sigue funcionando en memoria. */
  }
}

/* ============ Utilidades ============ */
function leerNota(valor) {
  // Acepta coma o punto decimal (ej: 4,5 o 4.5)
  const limpio = String(valor).trim().replace(",", ".");
  if (limpio === "") return NaN;
  return Number(limpio);
}

function mostrarError(msg, campo) {
  errorBox.textContent = msg;
  errorBox.hidden = false;
  inputNombre.classList.remove("invalid");
  inputNota.classList.remove("invalid");
  if (campo) campo.classList.add("invalid");
  if (campo) campo.focus();
}

function limpiarError() {
  errorBox.hidden = true;
  errorBox.textContent = "";
  inputNombre.classList.remove("invalid");
  inputNota.classList.remove("invalid");
}

function formatearNota(n) {
  return n.toFixed(1);
}

/* ============ Vista previa del desempeño ============ */
function actualizarPreview() {
  const nota = leerNota(inputNota.value);
  if (Number.isNaN(nota) || nota < 0 || nota > 5) {
    previewBadge.className = "badge badge-empty";
    previewBadge.textContent = "Sin nota";
    return;
  }
  const estado = obtenerEstado(nota);
  previewBadge.className = `badge badge-${estado.clase}`;
  previewBadge.textContent = estado.texto;
}

/* ============ Renderizado ============ */
function crearBadge(estado) {
  const span = document.createElement("span");
  span.className = `badge badge-${estado.clase}`;
  span.textContent = estado.texto;
  return span;
}

function renderTabla() {
  tbody.replaceChildren();

  estudiantes.forEach((est, i) => {
    const tr = document.createElement("tr");
    tr.style.animationDelay = `${Math.min(i, 8) * 40}ms`;

    const tdIdx = document.createElement("td");
    tdIdx.className = "td-index";
    tdIdx.textContent = i + 1;

    const tdNombre = document.createElement("td");
    tdNombre.className = "td-name";
    tdNombre.textContent = est.nombre; // textContent evita inyección de HTML

    const tdNota = document.createElement("td");
    tdNota.className = "td-nota";
    tdNota.textContent = formatearNota(est.nota);

    const tdEstado = document.createElement("td");
    tdEstado.appendChild(crearBadge(obtenerEstado(est.nota)));

    const tdAcc = document.createElement("td");
    tdAcc.className = "td-actions";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-icon";
    btn.title = "Eliminar";
    btn.setAttribute("aria-label", `Eliminar a ${est.nombre}`);
    btn.textContent = "✕";
    btn.addEventListener("click", () => eliminar(est.id));
    tdAcc.appendChild(btn);

    tr.append(tdIdx, tdNombre, tdNota, tdEstado, tdAcc);
    tbody.appendChild(tr);
  });
}

function renderStats() {
  const total = estudiantes.length;
  statTotal.textContent = total;

  if (total === 0) {
    statPromedio.textContent = "—";
    statMax.textContent = "—";
    statMin.textContent = "—";
    return;
  }

  const notas = estudiantes.map((e) => e.nota);
  const suma = notas.reduce((a, b) => a + b, 0);
  statPromedio.textContent = (suma / total).toFixed(2);
  statMax.textContent = formatearNota(Math.max(...notas));
  statMin.textContent = formatearNota(Math.min(...notas));
}

function renderDistribucion() {
  distBars.replaceChildren();
  const total = estudiantes.length;

  Object.values(ESTADOS).forEach((estado) => {
    const cantidad = estudiantes.filter((e) => obtenerEstado(e.nota) === estado).length;
    const pct = total ? (cantidad / total) * 100 : 0;

    const row = document.createElement("div");
    row.className = "dist-row";

    const label = document.createElement("span");
    label.className = "dist-label";
    label.textContent = estado.texto.replace("!", "");

    const track = document.createElement("div");
    track.className = "dist-track";
    const fill = document.createElement("div");
    fill.className = `dist-fill fill-${estado.clase}`;
    fill.style.width = "0%";
    track.appendChild(fill);
    requestAnimationFrame(() => (fill.style.width = `${pct}%`));

    const count = document.createElement("span");
    count.className = "dist-count";
    count.textContent = cantidad;

    row.append(label, track, count);
    distBars.appendChild(row);
  });
}

function render() {
  const hayDatos = estudiantes.length > 0;

  emptyBox.hidden = hayDatos;
  tableWrap.hidden = !hayDatos;
  distribution.hidden = !hayDatos;
  btnLimpiar.hidden = !hayDatos;

  if (hayDatos) {
    const n = estudiantes.length;
    resumenTexto.textContent = `${n} ${n === 1 ? "estudiante registrado" : "estudiantes registrados"}.`;
    renderTabla();
    renderDistribucion();
  } else {
    resumenTexto.textContent = "Aún no hay registros.";
  }
  renderStats();
}

/* ============ Acciones ============ */
function agregar(nombre, nota) {
  estudiantes.push({ id: Date.now() + Math.random(), nombre, nota });
  guardar();
  render();
}

function eliminar(id) {
  estudiantes = estudiantes.filter((e) => e.id !== id);
  guardar();
  render();
}

function limpiarTodo() {
  if (!estudiantes.length) return;
  if (confirm("¿Seguro que quieres borrar todos los registros?")) {
    estudiantes = [];
    guardar();
    render();
  }
}

/* ============ Eventos ============ */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  limpiarError();

  const nombre = inputNombre.value.trim();
  const nota = leerNota(inputNota.value);

  if (!nombre) {
    mostrarError("Por favor ingresa el nombre del estudiante.", inputNombre);
    return;
  }
  if (Number.isNaN(nota)) {
    mostrarError("Ingresa una nota válida (por ejemplo 4.2).", inputNota);
    return;
  }
  if (nota < 0.0 || nota > 5.0) {
    mostrarError("Error: la nota debe estar entre 0.0 y 5.0. Intenta de nuevo.", inputNota);
    return;
  }

  agregar(nombre, nota);
  form.reset();
  actualizarPreview();
  inputNombre.focus();
});

inputNota.addEventListener("input", () => {
  limpiarError();
  actualizarPreview();
});
inputNombre.addEventListener("input", limpiarError);
btnLimpiar.addEventListener("click", limpiarTodo);

/* ============ Inicio ============ */
render();
actualizarPreview();