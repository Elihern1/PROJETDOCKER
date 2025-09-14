// /public/js/script.js

const API_BASE = "/api/games";

// --- DOM ---
const tbody = document.getElementById("gameTableBody");
const alertBox = document.getElementById("alertContainer");
const alertMsg = document.getElementById("alertMessage");

// Formulaire d'ajout
const form = document.getElementById("gameForm");
const fTitle = document.getElementById("title");
const fPlatform = document.getElementById("platform");
const fGenre = document.getElementById("genre");
const fReleaseYear = document.getElementById("releaseYear");
const fPrice = document.getElementById("price");
const fInStock = document.getElementById("inStock");

// Modal d'édition
const editForm = document.getElementById("editGameForm");
const editId = document.getElementById("editId");
const editTitle = document.getElementById("editTitle");
const editPlatform = document.getElementById("editPlatform");
const editGenre = document.getElementById("editGenre");
const editReleaseYear = document.getElementById("editReleaseYear");
const editPrice = document.getElementById("editPrice");
const editInStock = document.getElementById("editInStock");
let editModalInstance = null;

// Modal suppression
const confirmDeleteModalEl = document.getElementById("confirmDeleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const deleteTitlePreview = document.getElementById("deleteTitlePreview");
const deleteIdInput = document.getElementById("deleteId");
let confirmDeleteModalInstance = null;

// --- Helpers ---
function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showAlert(message, type = "success", ms = 2500) {
  alertBox.classList.remove("d-none", "alert-success", "alert-danger", "alert-info", "alert-warning");
  alertBox.classList.add(`alert-${type}`);
  alertMsg.textContent = message;
  if (ms) setTimeout(() => alertBox.classList.add("d-none"), ms);
}

function yearFromDateLike(v) {
  try {
    if (!v) return "";
    const y = new Date(v).getFullYear();
    return Number.isFinite(y) ? y : "";
  } catch {
    return "";
  }
}

function dateFromYearInput(value) {
  if (!value) return undefined;
  const y = Number(value);
  if (!Number.isFinite(y)) return undefined;
  return new Date(y, 0, 1);
}

// --- Chargement des jeux ---
async function loadGames() {
  tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Chargement…</td></tr>`;
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`GET ${res.status}`);
    const games = await res.json();
    renderRows(games);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Erreur de chargement</td></tr>`;
  }
}

function renderRows(games) {
  if (!Array.isArray(games) || games.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Aucun jeu</td></tr>`;
    return;
  }

  tbody.innerHTML = games.map(g => {
    const year = yearFromDateLike(g.releaseDate);
    const price = (typeof g.price === "number") ? g.price.toFixed(2) : (g.price ?? "");
    const stock = g.inStock ? "Oui" : "Non";

    return `
      <tr data-id="${g._id}">
        <td>${escapeHtml(g.title)}</td>
        <td>${escapeHtml(g.platform)}</td>
        <td>${escapeHtml(g.genre ?? "")}</td>
        <td>${escapeHtml(year)}</td>
        <td>${escapeHtml(price)}</td>
        <td>${stock}</td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary edit-btn me-2">Modifier</button>
          <button class="btn btn-sm btn-outline-danger delete-btn">Supprimer</button>
        </td>
      </tr>
    `;
  }).join("");
}

// --- Ajout (POST) ---
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    title: fTitle.value.trim(),
    platform: fPlatform.value.trim(),
    genre: fGenre.value.trim() || undefined,
    releaseDate: dateFromYearInput(fReleaseYear.value),
    price: fPrice.value ? Number(fPrice.value) : undefined,
    inStock: !!fInStock.checked,
  };

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `POST ${res.status}`);

    form.reset();
    fInStock.checked = true;
    showAlert("Jeu ajouté avec succès !");
    await loadGames();
  } catch (err) {
    console.error(err);
    showAlert(err.message || "Erreur lors de l'ajout", "danger", 5000);
  }
});

// --- Ouvrir le modal d'édition ---
tbody.addEventListener("click", async (e) => {
  const editBtn = e.target.closest(".edit-btn");
  const delBtn = e.target.closest(".delete-btn");
  if (!editBtn && !delBtn) return;

  const tr = e.target.closest("tr");
  const id = tr?.dataset?.id;
  if (!id) return;

  // EDIT
  if (editBtn) {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      const g = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(g?.error || `GET ${res.status}`);

      editId.value = g._id || "";
      editTitle.value = g.title ?? "";
      editPlatform.value = g.platform ?? "";
      editGenre.value = g.genre ?? "";
      editReleaseYear.value = yearFromDateLike(g.releaseDate) || "";
      editPrice.value = (typeof g.price === "number" ? g.price : (g.price ?? ""));
      editInStock.checked = !!g.inStock;

      if (!editModalInstance && window.bootstrap) {
        editModalInstance = new bootstrap.Modal(document.getElementById("editGameModal"));
      }
      editModalInstance?.show();
    } catch (err) {
      console.error(err);
      showAlert("Impossible de charger le jeu à modifier", "danger", 5000);
    }
    return;
  }

  // DELETE (ouvre la confirmation)
  if (delBtn) {
    deleteIdInput.value = id;
    deleteTitlePreview.textContent = tr.querySelector("td")?.textContent?.trim() || "ce jeu";
    if (!confirmDeleteModalInstance && window.bootstrap) {
      confirmDeleteModalInstance = new bootstrap.Modal(confirmDeleteModalEl);
    }
    confirmDeleteModalInstance?.show();
  }
});

// --- Enregistrer la modification (PUT) ---
editForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = editId.value;
  if (!id) return;

  const releaseDate = dateFromYearInput(editReleaseYear.value);
  const payload = {
    title: editTitle.value.trim(),
    platform: editPlatform.value.trim(),
    genre: editGenre.value.trim() || undefined,
    price: editPrice.value ? Number(editPrice.value) : undefined,
    inStock: !!editInStock.checked,
    ...(releaseDate ? { releaseDate } : {}),
  };

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `PUT ${res.status}`);

    editModalInstance?.hide();
    showAlert("Jeu modifié avec succès !");
    await loadGames();
  } catch (err) {
    console.error(err);
    showAlert(err.message || "Erreur lors de la modification", "danger", 5000);
  }
});

// --- Confirmer suppression (DELETE) ---
confirmDeleteBtn?.addEventListener("click", async () => {
  const id = deleteIdInput.value;
  if (!id) return;
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `DELETE ${res.status}`);
    }
    confirmDeleteModalInstance?.hide();
    showAlert("Jeu supprimé avec succès !");
    await loadGames();
  } catch (err) {
    console.error(err);
    showAlert(err.message || "Erreur lors de la suppression", "danger", 5000);
  }
});

// --- Init ---
document.addEventListener("DOMContentLoaded", () => {
  if (window.flatpickr) {
    flatpickr("#releaseYear", { locale: "fr", dateFormat: "Y", allowInput: true });
    flatpickr("#editReleaseYear", { locale: "fr", dateFormat: "Y", allowInput: true });
  }
  loadGames();
});