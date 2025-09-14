// --------- Helpers UI ----------
function showAlert(message, type = "success") {
  const alert = document.getElementById("alertContainer");
  const msg = document.getElementById("alertMessage");
  alert.classList.remove("d-none", "alert-success", "alert-danger", "alert-info");
  alert.classList.add(`alert-${type}`);
  msg.textContent = message;

  // auto-hide après 3s
  setTimeout(() => {
    alert.classList.add("d-none");
  }, 3000);
}

function setLoading(isLoading) {
  const btn = document.querySelector("#gameForm button[type='submit']");
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Ajout en cours..." : "Ajouter le jeu";
}

// --------- API ----------
const API_BASE = "/api/games";

async function fetchGames() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Erreur lors du chargement des jeux");
  return res.json();
}

async function createGame(payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Erreur lors de la création");
  }
  return res.json();
}

async function deleteGame(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (res.status === 204) return true;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Suppression impossible");
  }
  return true;
}

// --------- Rendu du tableau ----------
function renderGamesTable(games = []) {
  const tbody = document.getElementById("gameTableBody");
  tbody.innerHTML = "";

  if (!games.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted">Aucun jeu pour le moment</td>
      </tr>`;
    return;
  }

  for (const g of games) {
    const tr = document.createElement("tr");

    const year =
      g.releaseDate ? new Date(g.releaseDate).getFullYear() :
      g.releaseYear ?? "-";

    tr.innerHTML = `
      <td>${escapeHTML(g.title)}</td>
      <td>${escapeHTML(g.platform)}</td>
      <td>${escapeHTML(g.genre || "-")}</td>
      <td>${year}</td>
      <td>${Number(g.price).toFixed(2)}</td>
      <td>${g.inStock ? "Oui" : "Non"}</td>
    `;

    // bouton supprimer
    const tdActions = document.createElement("td");
    const btnDel = document.createElement("button");
    btnDel.className = "btn btn-sm btn-outline-danger";
    btnDel.textContent = "Supprimer";
    btnDel.addEventListener("click", async () => {
      if (!confirm(`Supprimer "${g.title}" ?`)) return;
      try {
        await deleteGame(g._id);
        showAlert("Jeu supprimé", "success");
        await loadAndRender(); // refresh
      } catch (e) {
        showAlert(e.message || "Erreur de suppression", "danger");
      }
    });
    tdActions.appendChild(btnDel);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  }
}

// petite fonction d’échappement pour éviter l’injection
function escapeHTML(str) {
  return (str ?? "").toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// --------- Formulaire ----------
function setupForm() {
  const form = document.getElementById("gameForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const platform = document.getElementById("platform").value.trim();
    const genre = document.getElementById("genre").value.trim();
    const releaseYear = document.getElementById("releaseYear").value.trim();
    const price = document.getElementById("price").value;
    const inStock = document.getElementById("inStock").checked;

    // Le modèle attend releaseDate (Date). On convertit l'année en 1er janvier de l’année.
    let releaseDate = undefined;
    if (releaseYear) {
      const y = parseInt(releaseYear, 10);
      if (!isNaN(y) && y >= 1970 && y <= 2100) {
        releaseDate = `${y}-01-01`;
      }
    }

    const payload = {
      title,
      platform,
      genre: genre || undefined,
      price: Number(price),
      inStock,
      ...(releaseDate ? { releaseDate } : {}),
    };

    try {
      setLoading(true);
      await createGame(payload);
      form.reset();
      showAlert("Jeu ajouté avec succès !");
      await loadAndRender();
    } catch (err) {
      showAlert(err.message || "Erreur lors de l’ajout", "danger");
    } finally {
      setLoading(false);
    }
  });
}

// --------- Chargement initial ----------
async function loadAndRender() {
  try {
    const games = await fetchGames();
    renderGamesTable(games);
  } catch (e) {
    renderGamesTable([]);
    showAlert(e.message || "Impossible de charger les jeux", "danger");
  }
}

function initFlatpickrYear() {
  // on utilise flatpickr pour faciliter la saisie d'année
  if (window.flatpickr) {
    flatpickr("#releaseYear", {
      dateFormat: "Y",
      altInput: true,
      altFormat: "Y",
      allowInput: true,
      defaultDate: null,
    });
  }
}

// Démarrage
document.addEventListener("DOMContentLoaded", () => {
  initFlatpickrYear();
  setupForm();
  loadAndRender();
});