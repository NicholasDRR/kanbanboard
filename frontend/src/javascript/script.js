let globalAllTasksData;
let globalButtonValue;
let globalColumnValue;
let currentEditingCard;
let jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNWZhMmJjNS1iOTNkLTRmZGMtYmFkYy0wYTIxMDYxYzkyZGYiLCJleHAiOjE3MzI2NjE2MjZ9.Q_u_9TH5NM2m_nyV4IQ0_lDQV7bYhUom_huc1NoU27E';
let ambient = 'localhost'
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
function toLowerCase(str) {
    return str.toLowerCase();
}


function getCardById(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
        // O card foi encontrado, você pode realizar as ações necessárias
        console.log("Card encontrado:", card);
        return card;
    } else {
        console.error("Card não encontrado com o ID:", cardId);
        return null;
    }
}



$(document).ready(function() {
    readTasks().then(function(tasks) {
        globalAllTasksData = tasks;
        insertBackLogCards();
        insertDoingCards();
        insertReviewCards();
        insertDoneCards();
    }).catch(function(error) {
        console.error("Failed to read tasks:", error);
    });
});


function insertBackLogCards() {
    if (Array.isArray(globalAllTasksData)) {
        globalAllTasksData.forEach(function(task) {
            if (task.status == "backlog") {
                addKanbanCard(1, task.id, task.title, task.description, task.status, task.priority, task.link);
            }
        });
    } else {
        console.warn("globalAllTasksData não é um array.");
    }
}

function insertDoingCards() {
    if (Array.isArray(globalAllTasksData)) {
        globalAllTasksData.forEach(function(task) {
            if (task.status == "doing") {
                addKanbanCard(2, task.id, task.title, task.description, task.status, task.priority, task.link);
            }
        });
    } else {
        console.warn("globalAllTasksData não é um array.");
    }
}

function insertReviewCards() {
    if (Array.isArray(globalAllTasksData)) {
        globalAllTasksData.forEach(function(task) {
            if (task.status == "review") {
                addKanbanCard(3, task.id, task.title, task.description, task.status, task.priority, task.link);
            }
        });
    } else {
        console.warn("globalAllTasksData não é um array.");
    }
}

function insertDoneCards() {
    if (Array.isArray(globalAllTasksData)) {
        globalAllTasksData.forEach(function(task) {
            if (task.status == "done") {
                addKanbanCard(4, task.id, task.title, task.description, task.status, task.priority, task.link);
            }
        });
    } else {
        console.warn("globalAllTasksData não é um array.");
    }
}


function fullDeleteCards(item_id) {
    try {
        deleteTask(item_id);
        deleteCard(item_id);
        console.log(`Item ${item_id} deletado com sucesso.`);
    } catch (error) {
        console.error(`Erro ao deletar a tarefa do item ${item_id}:`, error);
    }
}






function readTasks() {
    return $.ajax({
        url: `http://${ambient}:8000/tasks/`,
        crossDomain: true,
        type: "GET",
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Accept': 'application/json'
        }
    });
}


function readDeletedTasks() {
    $.ajax({
        url: `http://${ambient}:8000/tasks/deleted`,
        crossDomain: true,
        type: "GET",
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Accept': 'application/json'
        },
        success: function(tasks) {
            tasks.forEach(function(task) {
                console.log(task)
            });
        },
        error: function(xhr, status, error) {
            console.error("Error reading tasks:", error);
        }
    });
}

function readSpecificTask(taskId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `http://${ambient}:8000/tasks/task?item_id=${taskId}`,
            crossDomain: true,
            type: "GET",
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Accept': 'application/json'
            },
            success: function(response) {
                resolve(response); // Resolva a Promise com a resposta
            },
            error: function(xhr, status, error) {
                console.error("Error getting task details:", error);
                reject(error); // Rejeite a Promise em caso de erro
            }
        });
    });
}

function activeTask(taskId) {
    $.ajax({
        url: `http://${ambient}:8000/tasks/task/activate?item_id=${taskId}`,
        crossDomain: true,
        type: "PUT",
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        success: function(response) {
            console.log("Task activated successfully:", response);
        },
        error: function(xhr, status, error) {
            console.error("Error activating task:", error);
        }
    });
}

function deleteTask(taskId) {
    $.ajax({
        url: `http://${ambient}:8000/tasks/task/delete?item_id=${taskId}`,
        crossDomain: true,
        type: "DELETE",
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        success: function(response) {
            console.log("Task deleted successfully:", response);
        },
        error: function(xhr, status, error) {
            console.error("Error deleting task:", error);
        }
    });
}





document.getElementById("addCardForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const status = globalButtonValue;
    const column = globalColumnValue;

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const priority = document.getElementById("priority").value;
    const link = document.getElementById("link").value || "";

    try {
        const task_id = await saveTask(title, description, priority, status, link); // Espera a Promise ser resolvida
        console.log(task_id);
        if (task_id) {
            addKanbanCard(column, task_id, title, description, status, priority, link);
        } else {
            console.error("Falha ao salvar a tarefa. O cartão não foi adicionado.");
        }
    } catch (error) {
        console.error("Ocorreu um erro:", error);
    } finally {
        document.getElementById("addCardForm").reset();
        document.getElementById("addCardModal").style.display = "none";
    }
});



function saveTask(taskName, taskDescription, taskPriority, taskStatus, taskLink) {
    return new Promise((resolve, reject) => {
        taskStatus = taskStatus.toLowerCase();
        taskPriority = taskPriority.toLowerCase();

        var taskData = {
            title: taskName,
            description: taskDescription,
            status: taskStatus,
            priority: taskPriority
        };
        if (taskLink != null && taskLink != "#") {
            taskData["link"] = taskLink;
        }

        console.log(JSON.stringify(taskData));

        $.ajax({
            url: `http://${ambient}:8000/tasks/task/post`,
            crossDomain: true,
            type: "POST",
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Accept': 'application/json'
            },
            contentType: "application/json",
            data: JSON.stringify(taskData),
            success: function(response) {
                console.log("Task saved successfully:", response);
                resolve(response); // Resolve a Promise com a resposta
            },
            error: function(xhr, status, error) {
                console.error("Error saving task:", error);
                reject(error); // Rejeita a Promise em caso de erro
            }
        });
    });
}


function updateTask(taskData) {


    console.log(JSON.stringify(taskData))

    let updateURl;


    if(taskData.item_id)
    {
        updateURl = `http://${ambient}:8000/tasks/task/update?item_id=${taskData.item_id}`;
    }
    else
    {
        updateURl = `http://${ambient}:8000/tasks/task/update?item_id=${currentEditingCard}`
    }
    

    return new Promise((resolve, reject) => {
        $.ajax({
            url: updateURl,
            crossDomain: true,
            type: "PUT",
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Accept': 'application/json'
            },
            contentType: "application/json",
            data: JSON.stringify(taskData),
            success: function(response) {
                console.log("Task updated successfully:", response);
                resolve(response); // Resolve a Promise com a resposta
            },
            error: function(xhr, status, error) {
                console.error("Error updating task:", error);
                reject(error); // Rejeita a Promise em caso de erro
            }
        });
    });
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


function addKanbanCard(kanbanColumnId, item_id, title, description, status, priority, link) {
    const kanbanCards = document.querySelector(`.kanban-column[data-id="${kanbanColumnId}"] .kanban-cards`);
    const kanbanCard = document.createElement("div");
    kanbanCard.classList.add("kanban-card");
    kanbanCard.setAttribute("draggable", "true");
    kanbanCard.setAttribute("id", item_id);

    // Create badge for priority
    const badge = document.createElement("div");
    badge.classList.add("badge", toLowerCase(priority)); 
    const badgeText = document.createElement("span");
    badgeText.textContent = `${toTitleCase(priority)} priority`; //
    badge.appendChild(badgeText);

    // Create the kanban manipulate card section
    const manipulateCard = document.createElement("div");
    manipulateCard.classList.add("kanban-manipulate-card");

    // Create card title
    const cardTitle = document.createElement("p");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = title;
    manipulateCard.appendChild(cardTitle);

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
    editAnchor.onclick = () => openEditModal(item_id);

    // Create delete button
    const deleteButton = document.createElement("p");
    const deleteAnchor = document.createElement("button");
    deleteAnchor.classList.add("icon-button");
    deleteAnchor.onclick = () => fullDeleteCards(item_id); // Pass the kanbanCard to delete function

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
    kanbanCards.appendChild(kanbanCard);

}


function deleteCard(item_id) {
    const cardElement = document.getElementById(item_id);
    if (cardElement) {
        cardElement.remove(); 
        console.log(`Cartão com ID ${item_id} foi removido.`); 
    } else {
        console.log(`Cartão com ID ${item_id} não encontrado.`);
    }
}


// Open the edit modal and fill in the current card details
function openEditModal(item_id) {
    readSpecificTask(item_id).then(cardData => {
        currentEditingCard = item_id;
        document.getElementById("edit-title").value = cardData.title;
        document.getElementById("edit-description").value = cardData.description;
        document.getElementById("edit-priority").value = toTitleCase(cardData.priority);
        document.getElementById("edit-link").value = cardData.link || "";

        document.getElementById("editCardModal").style.display = "block";
    }).catch(error => {
        console.error("Failed to load task data:", error);
    });
}


document.getElementById("closeEditModal").addEventListener("click", function () {
    document.getElementById("editCardModal").style.display = "none";
});


document.getElementById("editCardForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    var taskData = {
        title: document.getElementById("edit-title").value,
        description: description = document.getElementById("edit-description").value,
        priority: toLowerCase(document.getElementById("edit-priority").value)
    };
    link = document.getElementById("edit-link").value
    if (link != null && link != "#") {
        taskData["link"] = link;
    }
    try {
        const task_id = await updateTask(taskData); // Espera a Promise ser resolvida
        console.log(task_id);
        if (task_id) {
            updateKanbanCard(currentEditingCard, taskData.title, taskData.description, toTitleCase(taskData.priority), taskData.link);
        } else {
            console.error("Falha ao salvar a tarefa. O cartão não foi adicionado.");
        }
    } catch (error) {
        console.error("Ocorreu um erro:", error);
    } finally {
        document.getElementById("editCardForm").reset();
        document.getElementById("editCardModal").style.display = "none";
    }
});


// Update the kanban card with new values
function updateKanbanCard(cardId, title, description, priority, link) {
    
    card = getCardById(cardId)
    console.log(card)

    card.querySelector(".card-title").textContent = title;

    console.log(toLowerCase(priority))
    const badge = card.querySelector(".badge");
    badge.className = ""; // Clear current classes
    badge.classList.add("badge", toLowerCase(priority)); 

    const anchor = card.querySelector("a");
    anchor.href = link;

    // Optional: Update the badge text if needed
    const badgeText = badge.querySelector("span");
    badgeText.textContent = `${priority} priority`;
}


function updateStatusKanbanCard(card, columnId) {
    taskData = {
        item_id: card.id,
    }

    if (columnId == "1") {
        taskData["status"]= "backlog"
    } else if (columnId == "2") {
        taskData["status"]= "doing"
    } else if (columnId == "3") {
        taskData["status"]= "review"
    } else if (columnId == "4") {
        taskData["status"]= "done"
    }

    updateTask(taskData)
}