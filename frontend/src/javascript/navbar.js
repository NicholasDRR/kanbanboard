const body = document.querySelector("body");
const darkLight = document.querySelector("#darkLight");
const sidebar = document.querySelector(".sidebar");
const submenuItems = document.querySelectorAll(".submenu_item");
const sidebarOpen = document.querySelector("#sidebarOpen");
const sidebarClose = document.querySelector(".collapse_sidebar");
const sidebarExpand = document.querySelector(".expand_sidebar");

// Defina o tema escuro por padrão
body.classList.add("dark");
darkLight.classList.replace("bx-sun", "bx-moon"); // Atualize o ícone do tema
darkLight.style.display = "none"; // Esconder o ícone de mudança de tema

// Lógica de inicialização da sidebar
if (window.innerWidth < 768) {
  sidebar.classList.add("close");
} else {
  sidebar.classList.remove("close");
}

// Eventos de clique para abrir e fechar a sidebar
sidebarOpen.addEventListener("click", () => sidebar.classList.toggle("close"));

sidebarClose.addEventListener("click", () => {
  sidebar.classList.add("close", "hoverable");
});

sidebarExpand.addEventListener("click", () => {
  sidebar.classList.remove("close", "hoverable");
});

// Eventos de hover na sidebar
sidebar.addEventListener("mouseenter", () => {
  if (sidebar.classList.contains("hoverable")) {
    sidebar.classList.remove("close");
  }
});

sidebar.addEventListener("mouseleave", () => {
  if (sidebar.classList.contains("hoverable")) {
    sidebar.classList.add("close");
  }
});

// Evento de clique para alternar tema claro/escuro (remover se não for necessário)
// darkLight.addEventListener("click", () => {
//   body.classList.toggle("dark");
//   if (body.classList.contains("dark")) {
//     darkLight.classList.replace("bx-sun", "bx-moon");
//   } else {
//     darkLight.classList.replace("bx-moon", "bx-sun");
//   }
// });

// Eventos para submenu
submenuItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    item.classList.toggle("show_submenu");
    submenuItems.forEach((item2, index2) => {
      if (index !== index2) {
        item2.classList.remove("show_submenu");
      }
    });
  });
});

// Adicione um evento de resize para controlar a sidebar em mudanças de tamanho de tela
window.addEventListener("resize", () => {
  if (window.innerWidth < 768) {
    sidebar.classList.add("close");
  } else {
    sidebar.classList.remove("close");
  }
});
