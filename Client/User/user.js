/* ===== AUTH CHECK ===== */
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "user") {
  window.location.href = "../Login/login.html";
}

/* ===== GLOBAL STATE ===== */
let voters = [];
let offset = 0;
const limit = 20;

let isSearchMode = false;
let searchQuery = "";

/* ===== TAB SWITCH ===== */
function openTab(evt, tabId) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  evt.target.classList.add("active");

  const btn = document.getElementById("loadMoreBtn");
  btn.style.display = tabId === "voters" ? "inline-block" : "none";
}

/* ===== LOGOUT ===== */
function logout() {
  localStorage.clear();
  window.location.href = "../Login/login.html";
}

/* ===== NORMAL VOTERS LOAD ===== */
function fetchVoters(reset = false) {
  const btn = document.getElementById("loadMoreBtn");

  if (reset) {
    offset = 0;
    voters = [];
    document.getElementById("voterTable").innerHTML = "";
    btn.disabled = false;
    btn.innerText = "Load More";
  }

  fetch(`/api/voters?limit=${limit}&offset=${offset}`, {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => res.json())
    .then(data => {
      if (data.length < limit) {
        btn.disabled = true;
        btn.innerText = "No More Voters";
      }

      voters = voters.concat(data);
      appendVoters(data);
      offset += limit;
    });
}

/* ===== SEARCH LOAD ===== */
function fetchSearchVoters() {
  const btn = document.getElementById("loadMoreBtn");

  fetch(
    `/api/voters/search?q=${searchQuery}&limit=${limit}&offset=${offset}`,
    { headers: { Authorization: "Bearer " + token } }
  )
    .then(res => res.json())
    .then(data => {
      if (data.length < limit) {
        btn.disabled = true;
        btn.innerText = "No More Results";
      }

      voters = voters.concat(data);
      appendVoters(data);
      offset += limit;
    });
}

/* ===== APPEND ROWS ===== */
function appendVoters(data) {
  const table = document.getElementById("voterTable");

  data.forEach(v => {
    table.innerHTML += `
      <tr>
        <td>${v.name}</td>
        <td>${v.gender}</td>
        <td>${v.age}</td>
        <td>${v.mobile || "-"}</td>
        <td>${v.house_no || "-"}</td>
        <td>${v.epic}</td>
      </tr>
    `;
  });
}

/* ===== LOAD MORE BUTTON ===== */
function loadMoreVoters() {
  isSearchMode ? fetchSearchVoters() : fetchVoters();
}

/* ===== SEARCH ===== */
function searchVoter() {
  searchQuery = document.getElementById("searchInput").value.trim();
  const btn = document.getElementById("loadMoreBtn");

  offset = 0;
  voters = [];
  document.getElementById("voterTable").innerHTML = "";
  btn.disabled = false;
  btn.innerText = "Load More";

  if (searchQuery === "") {
    isSearchMode = false;
    fetchVoters(true);
    return;
  }

  isSearchMode = true;
  fetchSearchVoters();
}

/* ===== GRAPHS ===== */
function loadGenderGraph() {
  fetch("/api/voters/stats/gender", {
    headers: { Authorization: token }
  })
    .then(res => res.json())
    .then(data => {
      new Chart(genderChart, {
        type: "pie",
        data: {
          labels: data.map(d => d.gender),
          datasets: [{ data: data.map(d => d.count) }]
        }
      });
    });
}

function loadAgeGraph() {
  fetch("/api/voters/stats/age", {
    headers: { Authorization: token }
  })
    .then(res => res.json())
    .then(data => {
      new Chart(ageChart, {
        type: "bar",
        data: {
          labels: data.map(d => d.age_group),
          datasets: [{ label: "Voters", data: data.map(d => d.count) }]
        }
      });
    });
}

function loadSurnameGraph() {
  fetch("/api/voters/stats/surname", {
    headers: { Authorization: token }
  })
    .then(res => res.json())
    .then(data => {
      new Chart(surnameChart, {
        type: "bar",
        data: {
          labels: data.map(d => d.surname),
          datasets: [{ label: "Total Voters", data: data.map(d => d.count) }]
        }
      });

      const table = document.getElementById("surnameTable");
      table.innerHTML = "";
      data.forEach((d, i) => {
        table.innerHTML += `
          <tr>
            <td>${i + 1}</td>
            <td>${d.surname}</td>
            <td>${d.count}</td>
          </tr>
        `;
      });
    });
}

/* ===== INIT ===== */
fetchVoters(true);
loadGenderGraph();
loadAgeGraph();
loadSurnameGraph();
