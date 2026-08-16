import { auth, db } from "./firebase-config.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// 1. TEMA YÖNETİMİ (Light / Dark)
// ==========================================
const themeToggle = document.getElementById("themeToggle");
const currentTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", currentTheme);

themeToggle.addEventListener("click", () => {
  const active = document.documentElement.getAttribute("data-theme");
  const next = active === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

// ==========================================
// 2. PROJE LİSTESİ & STATİK YEDEK (Fallback)
// ==========================================
const initialProjects = [
  {
    title: "Minimalist Design System & UI Kit",
    category: "Design System / Web",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    link: "https://github.com"
  },
  {
    title: "Realtime Analytics Dashboard Engine",
    category: "Web Application",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    link: "https://github.com"
  },
  {
    title: "Ultra-Light Performance CSS Framework",
    category: "Open Source Tool",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    link: "https://github.com"
  }
];

const projectsGrid = document.getElementById("projectsGrid");

function renderProjects(projects) {
  projectsGrid.innerHTML = "";
  projects.forEach((proj) => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.innerHTML = `
      <div class="card-media-wrap">
        <img src="${proj.image}" alt="${proj.title}" loading="lazy" />
      </div>
      <div class="card-body">
        <span class="card-tag">${proj.category}</span>
        <h3 class="card-title">${proj.title}</h3>
        <a href="${proj.link}" target="_blank" rel="noopener noreferrer" class="card-footer-link">
          Projeyi İncele 
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
        </a>
      </div>
    `;
    projectsGrid.appendChild(card);
  });
}

// Projeleri Getir (Firebase yoksa yedek listeyi basar)
async function loadProjects() {
  try {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const liveProjects = [];
      snapshot.forEach(doc => liveProjects.push(doc.data()));
      renderProjects(liveProjects);
      return;
    }
  } catch (err) {
    console.warn("Firestore bağlantısı henüz yapılandırılmadı, yerel veriler yükleniyor.");
  }
  renderProjects(initialProjects);
}

loadProjects();

// ==========================================
// 3. GİZLİ ADMİN PANELİ & CTRL + B KISAYOLU
// ==========================================
const adminModal = document.getElementById("adminModal");
const adminBackdrop = document.getElementById("adminBackdrop");
const modalClose = document.getElementById("modalClose");

function openAdminModal() {
  adminModal.classList.add("active");
  adminModal.setAttribute("aria-hidden", "false");
}

function closeAdminModal() {
  adminModal.classList.remove("active");
  adminModal.setAttribute("aria-hidden", "true");
}

// CTRL + B veya CMD + B Tetikleyicisi
window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
    e.preventDefault();
    if (adminModal.classList.contains("active")) {
      closeAdminModal();
    } else {
      openAdminModal();
    }
  }
  if (e.key === "Escape" && adminModal.classList.contains("active")) {
    closeAdminModal();
  }
});

adminBackdrop.addEventListener("click", closeAdminModal);
modalClose.addEventListener("click", closeAdminModal);

// ==========================================
// 4. FIREBASE AUTH & DASHBOARD KONTROLÜ
// ==========================================
let authMode = "login";
const authTitle = document.getElementById("authTitle");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const tabLoginBtn = document.getElementById("tabLoginBtn");
const tabRegisterBtn = document.getElementById("tabRegisterBtn");
const authError = document.getElementById("authError");

window.switchAuthTab = function(mode) {
  authMode = mode;
  authError.textContent = "";
  if (mode === "login") {
    authTitle.textContent = "Admin Girişi";
    authSubmitBtn.textContent = "Giriş Yap";
    tabLoginBtn.classList.add("active");
    tabRegisterBtn.classList.remove("active");
  } else {
    authTitle.textContent = "Yeni Admin Kaydı";
    authSubmitBtn.textContent = "Kayıt Ol ve Giriş Yap";
    tabRegisterBtn.classList.add("active");
    tabLoginBtn.classList.remove("active");
  }
};

const adminAuthForm = document.getElementById("adminAuthForm");
const adminAuthView = document.getElementById("adminAuthView");
const adminDashboardView = document.getElementById("adminDashboardView");
const adminWelcome = document.getElementById("adminWelcome");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");

// Auth State Dinleyici
onAuthStateChanged(auth, (user) => {
  if (user) {
    adminAuthView.classList.add("hidden");
    adminDashboardView.classList.remove("hidden");
    adminWelcome.textContent = `Hoş geldin, ${user.email.split("@")[0]}`;
  } else {
    adminAuthView.classList.remove("hidden");
    adminDashboardView.classList.add("hidden");
  }
});

// Giriş / Kayıt Form Gönderimi
adminAuthForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.textContent = "";
  
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  try {
    if (authMode === "login") {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    adminAuthForm.reset();
  } catch (error) {
    authError.textContent = "Hata: " + error.message;
  }
});

// Çıkış Yap
adminLogoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// Dashboard: Yeni Proje Ekleme
const addProjectForm = document.getElementById("addProjectForm");
addProjectForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const newProj = {
    title: document.getElementById("projTitle").value,
    category: document.getElementById("projCategory").value,
    image: document.getElementById("projImage").value,
    link: document.getElementById("projLink").value,
    createdAt: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, "projects"), newProj);
    alert("Proje başarıyla vitrine eklendi!");
    addProjectForm.reset();
    loadProjects();
  } catch (err) {
    alert("Veritabanına eklenirken hata oluştu: " + err.message);
  }
});
