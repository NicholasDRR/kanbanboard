let globalButtonValue;
let globalColumnValue;
let currentEditingCard;


const addCardButtons = document.querySelectorAll(".add-card");
const kanbanCards = document.querySelectorAll('.kanban-card');

const backEndUrl = 'http://54.219.225.136:8000/tasks';

function getJwtToken() {
    return localStorage.getItem('jwtToken'); 
}

function checkAuth() {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
        window.location.href = "http://54.219.225.136:80/login"; 
    }
}




function toTitleCase(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


// Seleciona todos os elementos com a classe '.kanban-card' e adiciona eventos a cada um deles
document.querySelectorAll('.kanban-card').forEach(card => {
    // Evento disparado quando começa a arrastar um card
    card.addEventListener('dragstart', e => {
        // Adiciona a classe 'dragging' ao card que está sendo arrastado
        e.currentTarget.classList.add('dragging');
    });
    // Evento disparado quando termina de arrastar o card
    card.addEventListener('dragend', e => {
        // Remove a classe 'dragging' quando o card é solto
        e.currentTarget.classList.remove('dragging');
    });
});


document.querySelectorAll('.kanban-manipulate-card').forEach(card => {
    card.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent click event from bubbling up if needed
        const kanbanCard = card.closest('.kanban-card'); // Get the closest parent kanban-card
        openViewModal(kanbanCard); // Pass the whole kanban card to the modal
    });
});




// Seleciona todos os elementos com a classe '.kanban-cards' (as colunas) e adiciona eventos a cada um deles
document.querySelectorAll('.kanban-cards').forEach(column => {
    // Evento disparado quando um card arrastado passa sobre uma coluna (drag over)
    column.addEventListener('dragover', e => {
        // Previne o comportamento padrão para permitir o "drop" (soltar) do card
        e.preventDefault();
        // Adiciona a classe 'cards-hover'
        e.currentTarget.classList.add('cards-hover');
    });
    // Evento disparado quando o card sai da área da coluna (quando o card é arrastado para fora)
    column.addEventListener('dragleave', e => {
        // Remove a classe 'cards-hover' quando o card deixa de estar sobre a coluna
        e.currentTarget.classList.remove('cards-hover');
    });
    // Evento disparado quando o card é solto (drop) dentro da coluna
    column.addEventListener('drop', e => {
        // Remove a classe 'cards-hover', já que o card foi solto
        e.currentTarget.classList.remove('cards-hover');
        // Seleciona o card que está sendo arrastado (que tem a classe 'dragging')
        const dragCard = document.querySelector('.kanban-card.dragging');
        e.currentTarget.appendChild(dragCard);
        const columnId = e.currentTarget.closest('.kanban-column').dataset.id;
        updateStatusKanbanCard(dragCard, columnId)
    });
});


// Open the view modal and fill it with the current card details
function openViewModal(card) {
    // Populate the view modal with card details
    document.getElementById("view-title").textContent = card.querySelector(".card-title").textContent;
    document.getElementById("view-description").textContent = card.querySelector(".card-description").textContent;
    document.getElementById("view-priority").textContent = toTitleCase(card.querySelector(".badge").classList[1]); // Assuming the second class is the priority
    document.getElementById("view-status").textContent = card.querySelector(".card-status").textContent;
    document.getElementById("view-link").href = card.querySelector("a").href || "";
    document.getElementById("view-link").textContent = card.querySelector("a").href ? "View Link" : "";

    document.getElementById("viewCardModal").style.display = "block";
}

// Close view modal
document.getElementById("closeViewModal").addEventListener("click", function () {
    document.getElementById("viewCardModal").style.display = "none";
});

// Optional: Close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target === document.getElementById("viewCardModal")) {
        document.getElementById("viewCardModal").style.display = "none";
    }
};



addCardButtons.forEach(button => {
    button.addEventListener("click", function () {
        globalButtonValue = this.getAttribute('data-value');
        globalColumnValue = this.getAttribute('column-value');
        document.getElementById("addCardModal").style.display = "block";
    });
});

document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("addCardModal").style.display = "none";
});


document.getElementById("addCardForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const status = globalButtonValue;
    const column = globalColumnValue;

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const priority = document.getElementById("priority").value;
    const link = document.getElementById("link").value || "#";

    addKanbanCard(column, title, description, status, priority, link);
    document.getElementById("addCardForm").reset();
    document.getElementById("addCardModal").style.display = "none";
});


function addKanbanCard(kanbanColumnId, title, description, status, priority, link) {
    const kanbanCards = document.querySelector(`.kanban-column[data-id="${kanbanColumnId}"] .kanban-cards`);
    const kanbanCard = document.createElement("div");
    kanbanCard.classList.add("kanban-card");
    kanbanCard.setAttribute("draggable", "true");

    // Create badge for priority
    const badge = document.createElement("div");
    badge.classList.add("badge", "medium"); // Assuming 'medium' as a static class, adjust as needed
    const badgeText = document.createElement("span");
    badgeText.textContent = `${priority} priority`; // Update this if priority values are different
    badge.appendChild(badgeText);

    // Create the kanban manipulate card section
    const manipulateCard = document.createElement("div");
    manipulateCard.classList.add("kanban-manipulate-card");

    // Create card title
    const cardTitle = document.createElement("p");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = title;

    // Create card description
    const cardDescription = document.createElement("p");
    cardDescription.classList.add("card-description");
    cardDescription.textContent = description;

    // Create card status
    const cardStatus = document.createElement("p");
    cardStatus.classList.add("card-status");
    cardStatus.textContent = `Status: ${status}`;

    // Append title, description, and status to the manipulate card section
    manipulateCard.appendChild(cardTitle);
    manipulateCard.appendChild(cardDescription);
    manipulateCard.appendChild(cardStatus);

    // Create card infos section
    const cardInfos = document.createElement("div");
    cardInfos.classList.add("card-infos");
    
    // Create card icons section
    const cardIcons = document.createElement("div");
    cardIcons.classList.add("card-icons");

    // Create link element
    const linkElement = document.createElement("p");
    const anchor = document.createElement("a");
    anchor.classList.add("icon-button");
    anchor.href = link;
    anchor.target = "_blank"; // Open link in a new tab

    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-paperclip");
    anchor.appendChild(icon);
    linkElement.appendChild(anchor);
    cardIcons.appendChild(linkElement);

    // Create edit button
    const editButton = document.createElement("p");
    const editAnchor = document.createElement("button");
    editAnchor.classList.add("edit-button");
    editAnchor.onclick = () => { /* Add your edit function here */ };
    const editIcon = document.createElement("i");
    editIcon.classList.add("fa-solid", "fa-edit");
    editAnchor.appendChild(editIcon);
    editButton.appendChild(editAnchor);
    cardIcons.appendChild(editButton);

    // Create delete button
    const deleteButton = document.createElement("p");
    const deleteAnchor = document.createElement("button");
    deleteAnchor.classList.add("icon-button");
    deleteAnchor.onclick = () => deleteCard(kanbanCard); // Pass the kanbanCard to delete function
    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-solid", "fa-trash");
    deleteAnchor.appendChild(deleteIcon);
    deleteButton.appendChild(deleteAnchor);
    cardIcons.appendChild(deleteButton);

    // Assemble the card
    cardInfos.appendChild(cardIcons);
    kanbanCard.appendChild(badge);
    kanbanCard.appendChild(manipulateCard);
    kanbanCard.appendChild(cardInfos);

    // Add drag events
    kanbanCard.addEventListener('dragstart', e => {
        e.currentTarget.classList.add('dragging');
    });

    kanbanCard.addEventListener('dragend', e => {
        e.currentTarget.classList.remove('dragging');
    });

    // Append the new card to the kanban column
    kanbanCards.appendChild(kanbanCard);
}









kanbanCards.forEach(card => {
    // Add event listener for edit button
    card.querySelector('.edit-button').addEventListener('click', () => {
        openEditModal(card);
    });
});

// Open the edit modal and fill in the current card details
function openEditModal(card) {
    currentEditingCard = card;
    // Populate the edit modal with current card details
    document.getElementById("edit-title").value = card.querySelector(".card-title").textContent;
    document.getElementById("edit-description").value = card.querySelector(".card-description").textContent;
    document.getElementById("edit-priority").value = toTitleCase(card.querySelector(".badge").classList[1]); // Assuming the second class is the priority
    document.getElementById("edit-link").value = card.querySelector("a").href || "";

    document.getElementById("editCardModal").style.display = "block";
}
// Close edit modal
document.getElementById("closeEditModal").addEventListener("click", function () {
    document.getElementById("editCardModal").style.display = "none";
});


// Handle form submission for editing
document.getElementById("editCardForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("edit-title").value;
    const description = document.getElementById("edit-description").value;
    const priority = toTitleCase(document.getElementById("edit-priority").value);
    const link = document.getElementById("edit-link").value || "#";

    updateKanbanCard(currentEditingCard, title, description, priority, link);
    document.getElementById("editCardForm").reset();
    document.getElementById("editCardModal").style.display = "none";
});



// Update the kanban card with new values
function updateKanbanCard(card, title, description, priority, link) {
    card.querySelector(".card-title").textContent = title;
    card.querySelector(".card-description").textContent = description;
    
    const badge = card.querySelector(".badge");
    badge.className = ""; // Clear current classes
    badge.classList.add("badge", priority.toLowerCase()); // Add new priority class

    const anchor = card.querySelector("a");
    anchor.href = link;

    // Optional: Update the badge text if needed
    const badgeText = badge.querySelector("span");
    badgeText.textContent = `${priority} priority`;
}


function updateStatusKanbanCard(card, columnId) {
    if (columnId == "1") {
        card.querySelector(".card-status").textContent = "Backlog";
    } else if (columnId == "2") {
        card.querySelector(".card-status").textContent = "Doing";
    } else if (columnId == "3") {
        card.querySelector(".card-status").textContent = "Review";
    } else if (columnId == "4") {
        card.querySelector(".card-status").textContent = "Done";
    }
}