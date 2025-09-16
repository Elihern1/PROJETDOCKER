const API_BASE = "/api/games";

// DOM
const tbody = document.getElementById("gameTableBody");
const alertBox = document.getElementById("alertContainer");
const alertMsg = document.getElementById("alertMessage");

// Formulaire d'ajout
const form = document.getElementById("gameForm");
const fTitle = document.getElementById("title");
const fPlatform = document.getElementById("platform");
const fGenre = document.getElementById("genre");
const fReleaseYear = document.getElementById("releaseYear"); // => 'date' (année)
const fPrice = document.getElementById("price");
const fInStock = document.getElementById("inStock");

// Modal d'édition (si présent dans ta page)
const editForm = document.getElementById("editGameForm");
const editId = document.getElementById("editId");
const editTitle = document.getElementById("editTitle");
const editPlatform = document.getElementById("editPlatform");
const editGenre = document.getElementById("editGenre");
const editReleaseYear = document.getElementById("editReleaseYear"); // => 'date'
const editPrice = document.getElementById("editPrice");
const editInStock = document.getElementById("editInStock");

let editModalInstance = null;

// Helpers
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

// Chargement des jeux
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
    const year = Number.isFinite(Number(g.date)) ? Number(g.date) : "";
    const price = (typeof g.price === "number") ? g.price.toFixed(2) : (g.price ?? "");
    const stock = g.inStock ? "Oui" : "Non";
    const genre = (g.genre && String(g.genre).trim()) ? g.genre : "Inconnu";

    return `
      <tr data-id="${g._id}">
        <td>${escapeHtml(g.title)}</td>
        <td>${escapeHtml(g.platform)}</td>
        <td>${escapeHtml(genre)}</td>
        <td>${escapeHtml(year)}</td>
        <td>${escapeHtml(price)}</td>
        <td>${stock}</td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary edit-btn">Modifier</button>
          <button class="btn btn-sm btn-outline-danger delete-btn">Supprimer</button>
        </td>
      </tr>
    `;
  }).join("");
}

// Ajout (POST)
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const yearVal = fReleaseYear.value?.trim();
  const yearNum = Number(yearVal);

  if (!Number.isFinite(yearNum)) {
    showAlert("Veuillez saisir une année valide (ex: 2020).", "warning", 4000);
    return;
  }

  const payload = {
    title: fTitle.value.trim(),
    platform: fPlatform.value.trim(),
    genre: fGenre.value.trim() || undefined,
    price: fPrice.value ? Number(fPrice.value) : undefined,
    date: yearNum,                       
    inStock: document.getElementById("inStock").checked     
  };

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `POST ${res.status}`);
    }
    form.reset();
    if (fInStock) fInStock.checked = true; // remettre coché par défaut
    showAlert("Jeu ajouté avec succès !");
    await loadGames();
  } catch (err) {
    console.error(err);
    showAlert(err.message || "Erreur lors de l'ajout", "danger", 4000);
  }
});

// Ouvrir le modal (pré-rempli)
tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest(".edit-btn");
  if (!btn) return;

  const tr = btn.closest("tr");
  const id = tr?.dataset?.id;
  if (!id) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error(`GET ${res.status}`);
    const g = await res.json();

    // Préremplir
    if (editId) editId.value = g._id;
    if (editTitle) editTitle.value = g.title ?? "";
    if (editPlatform) editPlatform.value = g.platform ?? "";
    if (editGenre) editGenre.value = g.genre ?? "";
    if (editReleaseYear) editReleaseYear.value = Number.isFinite(Number(g.date)) ? Number(g.date) : "";
    if (editPrice) editPrice.value = (typeof g.price === "number" ? g.price : (g.price ?? ""));
    if (editInStock) editInStock.checked = !!g.inStock;

    // Afficher le modal
    if (!editModalInstance && window.bootstrap) {
      editModalInstance = new bootstrap.Modal(document.getElementById("editGameModal"));
    }
    editModalInstance?.show();
  } catch (err) {
    console.error(err);
    showAlert("Impossible de charger le jeu à modifier", "danger", 4000);
  }
});

// Enregistrer la modification (PUT)
editForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = editId?.value;
  if (!id) return;

  const y = editReleaseYear?.value?.trim();
  const yearNum = Number(y);
  if (!Number.isFinite(yearNum)) {
    showAlert("Veuillez saisir une année valide (ex: 2020).", "warning", 4000);
    return;
  }

  const payload = {
    title: editTitle?.value.trim(),
    platform: editPlatform?.value.trim(),
    genre: editGenre?.value.trim() || undefined,
    price: editPrice?.value ? Number(editPrice.value) : undefined,
    date: yearNum,                     
    inStock: document.getElementById("editInStock").checked,
  };

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `PUT ${res.status}`);
    }
    editModalInstance?.hide();
    showAlert("Jeu modifié avec succès !");
    await loadGames();
  } catch (err) {
    console.error(err);
    showAlert(err.message || "Erreur lors de la modification", "danger", 4000);
  }
});

// Supprimer avec confirmation
tbody.addEventListener("click", async (e) => {
  const btnDel = e.target.closest(".delete-btn");
  if (!btnDel) return;

  const tr = btnDel.closest("tr");
  const id = tr?.dataset?.id;
  if (!id) return;

  const ok = window.confirm("Supprimer ce jeu ? Cette action est irréversible.");
  if (!ok) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (res.status !== 204 && !res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `DELETE ${res.status}`);
    }
    showAlert("Jeu supprimé.");
    await loadGames();
  } catch (err) {
    console.error(err);
    showAlert(err.message || "Erreur lors de la suppression", "danger", 4000);
  }
});

// Init
document.addEventListener("DOMContentLoaded", () => {
  // Sélecteurs year
  if (window.flatpickr) {
    if (document.querySelector("#releaseYear")) {
      flatpickr("#releaseYear", { locale: "fr", dateFormat: "Y", allowInput: true });
    }
    if (document.querySelector("#editReleaseYear")) {
      flatpickr("#editReleaseYear", { locale: "fr", dateFormat: "Y", allowInput: true });
    }
  }
  loadGames();
});