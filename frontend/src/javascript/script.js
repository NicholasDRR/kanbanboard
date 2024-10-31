let globalAllTasksData;
let globalButtonValue;
let globalColumnValue;
let currentEditingCard;
let globalBoard;
let globalSearchTerm;
// let jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YmJkMjA0NS01NWNmLTQ5MGEtOTdjYS1kMDg2MTllMGEzYjUiLCJleHAiOjE3MzI5MTEwMjR9.Yr2yZKef0MJ7x-8DtSoXs7CLpQygs6EphFkQFTvdbr8';
let jwtToken;
let ambient = 'localhost'
const addCardButtons = document.querySelectorAll(".add-card");
const kanbanCards = document.querySelectorAll('.kanban-card');
const backEndUrl = 'http://54.219.225.136:8000/tasks';

function getJwtToken() {
    // return localStorage.getItem('jwtToken'); 
    jwtToken = localStorage.getItem('jwtToken'); 
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

function titleAnimation()
{
    const titleElement = document.querySelector('#boardTitle h1');
    titleElement.classList.remove("animate");
    void titleElement.offsetWidth;
    titleElement.classList.add("animate");
}

function formatDateToBrazilian(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function getCardById(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
        return card;
    } else {
        return null;
    }
}

function closeModal(modalId) {
    $(`#${modalId}`).css('display', 'none'); 
}


$(document).ready(function() {
    checkAuth()
    getJwtToken()



    $('.kanban').hide()
    $('.search_bar').hide();

    $('.welcome-button').on('click', function() {
        $('#welcomeContainer').hide()
        $('#kanbanBoardButton')[0].click(); 
    });

    
    $('.logo_item').on('click', function() {
        
        $('.kanban').hide()
        $('#box').hide()
        $('.search_bar').hide();
        $('#welcomeContainer').show()
    });



    $(window).on('click', function(event) {
        if ($(event.target).is('#noticeModal')) {
            closeModal('noticeModal');
        }
        if ($(event.target).is('#infoModal')) {
            closeModal('infoModal');
        }
        if ($(event.target).is('#notFoundModal')) {
            closeModal('notFoundModal');
        }
    });

    $('#searchInput').on('keypress', function(event) {
        if (event.key === 'Enter') {
            const searchValue = $(this).val().trim();
            if (searchValue) {
                readSearchBar(searchValue)
                    .then(({ id, status }) => { 
                        openViewModal(id);
                        $(this).val('');
                    })
                    .catch(({ status, error }) => {
                        if (status == 404)
                        {
                            $('#notFoundModal').css('display', 'flex');
                        }
                    });
            } else {
                console.log('O campo está vazio. Digite algo antes de pressionar Enter.');
            }
        }
    });

    $(document).on('click', '#logoutButton', function(e) {
        e.preventDefault();
        Logout();
    });


    $(document).on('click', '#settingsButton', function(e) {
        e.preventDefault();
        $('.search_bar').hide();
        $('.kanban').addClass('hidden');
        $('#welcomeContainer').css('display', 'none');
        
        $.ajax({
            url: 'src/components/password/index.html',
            type: 'GET',
            success: function(data) {
                $('#settingsPage').html(data).show();
                $('#myform-search')[0].reset(); 
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Failed to load settings page:", textStatus, errorThrown);
            }
        });
    });

    $('#kanbanBoardButton').click(function(e) {
        e.preventDefault(); 
        $('.kanban').css('display', 'flex');
        $('#welcomeContainer').css('display', 'none');
        $('.search_bar').show();

        globalBoard = 'default'
        globalSearchTerm = true

        document.querySelector('#boardTitle h1').innerText = 'KanbanBoard';
        titleAnimation()


        const buttons = document.getElementsByClassName('add-card');
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].style.display = 'block';
        }


        $('.kanban .kanban-cards').empty(); 
        $('#settingsPage').hide();
        $('.kanban').removeClass('hidden')
        
        readTasks().then(function(response) {
            const tasks = response.tasks;
            const status = response.status;
            globalAllTasksData = tasks;        
            insertBackLogCards();
            insertDoingCards();
            insertReviewCards();
            insertDoneCards();
        }).catch(function(error) {
            console.error("Failed to read tasks:", error);
            if (error.status === 404) { 
                $('#noticeModal').css('display', 'flex');
            }
        });
    }); 

    $('#kanbanRecycleBoardButton').click(function(e) {
        e.preventDefault(); 
        $('.kanban').css('display', 'flex');
        $('#welcomeContainer').css('display', 'none');
        $('.search_bar').show();
        globalBoard = 'recycle'
        globalSearchTerm = false
        
        document.querySelector('#boardTitle h1').innerText = 'RecycleBoard';
        titleAnimation()

        $('.kanban .kanban-cards').empty(); 
        $('#settingsPage').hide();
        $('.search_bar').show();

        const buttons = document.getElementsByClassName('add-card');

        for (let i = 0; i < buttons.length; i++) {
            buttons[i].style.display = 'none'; 
        }

        $('.kanban').removeClass('hidden')
        
        readDeletedTasks().then(function(response) {
            const tasks = response.tasks;
            const status = response.status;
            globalAllTasksData = tasks;
            insertBackLogCards();
            insertDoingCards();
            insertReviewCards();
            insertDoneCards();
        }).catch(function(error) {
            console.error("Failed to read tasks:", error);
            if (error.status === 404) { 
                $('#infoModal').css('display', 'flex');
            }
        });
    }); 


    $('#closeNoticeModal').on('click', function() {
        closeModal('noticeModal');
    });

    $('#closeInfoModal').on('click', function() {
        closeModal('infoModal');
    });

    $('#notFoundModal').on('click', function() {
        closeModal('notFoundModal');
    });

});


function insertBackLogCards() {
    if (Array.isArray(globalAllTasksData)) {
        globalAllTasksData.forEach(function(task) {
            if (task.status == "backlog") {

                if (globalBoard == 'recycle')
                {
                    addRecycleKanbanCard(1, task.id, task.title, task.description, task.status, task.priority, task.link);
                }
                
                if (globalBoard == 'default')
                {
                    addKanbanCard(1, task.id, task.title, task.description, task.status, task.priority, task.link);
                }
                
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
                if (globalBoard == 'recycle')
                {
                    addRecycleKanbanCard(2, task.id, task.title, task.description, task.status, task.priority, task.link);
                }
                    
                if (globalBoard == 'default')
                {
                    addKanbanCard(2, task.id, task.title, task.description, task.status, task.priority, task.link);
                }
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
                if (globalBoard == 'recycle')
                {
                    addRecycleKanbanCard(3, task.id, task.title, task.description, task.status, task.priority, task.link);
                }
                    
                if (globalBoard == 'default')
                {
                    addKanbanCard(3, task.id, task.title, task.description, task.status, task.priority, task.link);
                }
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
                if (globalBoard == 'recycle')
                {
                    addRecycleKanbanCard(4, task.id, task.title, task.description, task.status, task.priority, task.link);
                } 
                if (globalBoard == 'default')
                {
                    addKanbanCard(4, task.id, task.title, task.description, task.status, task.priority, task.link);
                }
            }
        });
    } else {
        console.warn("globalAllTasksData não é um array.");
    }
}


function fullDeleteCards(item_id) {
    try {
        if (globalBoard == 'recycle')
            {
                fullDeleteTask(item_id);
                deleteCard(item_id);
            } 
        if (globalBoard == 'default')
        {
            deleteTask(item_id);
            deleteCard(item_id);
        }
        
    } catch (error) {
        console.error(`Erro ao deletar a tarefa`);
    }
}

function restoreCard(item_id) {
    try{
        activeTask(item_id)
        deleteCard(item_id)
    } catch (error) {
        console.error(`Erro ao restaurar a tarefa`);
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
    }).then(function(tasks, textStatus, jqXHR) {
        // Return an object containing the tasks and the status
        return {
            tasks: tasks,
            status: jqXHR.status // Capture the HTTP status code
        };
    });
}


function readDeletedTasks() {
    return $.ajax({
        url: `http://${ambient}:8000/tasks/deleted`,
        crossDomain: true,
        type: "GET",
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Accept': 'application/json'
        },
        
    }).then(function(tasks, textStatus, jqXHR) {
        return {
            tasks: tasks,
            status: jqXHR.status 
        };
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

function readSearchBar(searchTerm) {
    let url = `http://${ambient}:8000/tasks/task/searchbar?search_term=${searchTerm}&active=${globalSearchTerm}`;

    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            crossDomain: true,
            type: "GET",
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Accept': 'application/json'
            },
            success: function(response, statusText, xhr) {
                resolve({ id: response.id, status: xhr.status }); // Retorna o id e o status
            },
            error: function(xhr, statusText, error) {
                console.error("Error getting task details:", error);
                reject({ status: xhr.status, error }); // Captura o status em caso de erro
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
            console.log("Task activated successfully:");
        },
        error: function(xhr, status, error) {
            console.error("Error activating task:");
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

function fullDeleteTask(taskId) {
    $.ajax({
        url: `http://${ambient}:8000/tasks/task/full_delete?item_id=${taskId}`,
        crossDomain: true,
        type: "DELETE",
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        success: function(response) {
            console.log("Task full deleted successfully:");
        },
        error: function(xhr, status, error) {
            console.error("Error deleting task:");
        }
    });
}

function Logout() {
    $.ajax({
        url: `http://localhost:8000/auth/logout`,
        crossDomain: true,
        type: "POST",
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        success: function(response) {
            localStorage.removeItem('jwtToken');
            window.location.href = "http://localhost:5501/frontend/login/login.html";
        },
        error: function(xhr, status, error) {
            console.error("Error in logout:");
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
        const task_id = await saveTask(title, description, priority, status, link);
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
                console.log("Task saved successfully:");
                resolve(response); // Resolve a Promise com a resposta
            },
            error: function(xhr, status, error) {
                console.error("Error saving task:");
                reject(error); // Rejeita a Promise em caso de erro
            }
        });
    });
}


function updateTask(taskData) {
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
                console.log("Task updated successfully:");
                resolve(response); // Resolve a Promise com a resposta
            },
            error: function(xhr, status, error) {
                console.error("Error updating task:");
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



async function openViewModal(cardId) {
    try {
        const cardData = await readSpecificTask(cardId);

        document.getElementById("view-title").textContent = toTitleCase(cardData.title);
        document.getElementById("view-description").textContent = toTitleCase(cardData.description);
        document.getElementById("view-priority").textContent = toTitleCase(cardData.priority); 
        document.getElementById("view-status").textContent = toTitleCase(cardData.status);
        

        const linkElement = document.getElementById("view-link");
        const linkContainer = document.getElementById("link-container");

        if (cardData.link && cardData.link !== "#") {
            linkElement.href = cardData.link;
            linkElement.textContent = "View Link"; 
            linkContainer.style.display = "block";
        } else {
            linkContainer.style.display = "none"; 
        }

        const updatedElement = document.getElementById("view-updated");
        const updatedContainer = document.getElementById("updated-container");

        if (cardData.updated_at) {
            updatedElement.textContent = formatDateToBrazilian(cardData.updated_at);
            updatedContainer.style.display = "block";
        } else {
            updatedContainer.style.display = "none"; 
        }

        const createdElement = document.getElementById("view-created");
        const createdContainer = document.getElementById("created-container");

        if (cardData.created_at) {
            createdElement.textContent = formatDateToBrazilian(cardData.created_at);
            createdContainer.style.display = "block";
        } else {
            createdContainer.style.display = "none"; 
        }

        const deletedElement = document.getElementById("view-deleted");
        const deletedContainer = document.getElementById("deleted-container");

        if (cardData.deleted_at) {
            deletedElement.textContent = formatDateToBrazilian(cardData.deleted_at);
            deletedContainer.style.display = "block";
        } else {
            deletedContainer.style.display = "none"; 
        }

        document.getElementById("viewCardModal").style.display = "block";
        document.getElementById("viewCardModal").setAttribute("aria-hidden", "false"); 
    } catch (error) {
        console.error("Error opening view modal:", error);
    }
}


document.getElementById("closeViewModal").addEventListener("click", function () {
    document.getElementById("viewCardModal").style.display = "none";
});

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

    if (link)
    {
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
    }
    

    // Create edit button
    const editButton = document.createElement("p");
    const editAnchor = document.createElement("button");
    editAnchor.classList.add("edit-button");
    const editIcon = document.createElement("i");
    editIcon.classList.add("fa-solid", "fa-edit");
    editAnchor.appendChild(editIcon);
    editButton.appendChild(editAnchor);
    cardIcons.appendChild(editButton);
    editAnchor.onclick = (event) => {event.stopPropagation(); openEditModal(item_id);};

    // Create delete button
    const deleteButton = document.createElement("p");
    const deleteAnchor = document.createElement("button");
    deleteAnchor.classList.add("icon-button");
    deleteAnchor.onclick = (event) => {event.stopPropagation(); fullDeleteCards(item_id);}; // Pass the kanbanCard to delete function

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

    kanbanCard.addEventListener('click', (event) => {
        event.stopPropagation();
        openViewModal(item_id)
    });

    kanbanCards.appendChild(kanbanCard);

}


function addRecycleKanbanCard(kanbanColumnId, item_id, title, description, status, priority, link) {
    const kanbanCards = document.querySelector(`.kanban-column[data-id="${kanbanColumnId}"] .kanban-cards`);
    const kanbanCard = document.createElement("div");
    kanbanCard.classList.add("kanban-card");
    kanbanCard.setAttribute("id", item_id);

    const badge = document.createElement("div");
    badge.classList.add("badge", toLowerCase(priority)); 
    const badgeText = document.createElement("span");
    badgeText.textContent = `${toTitleCase(priority)} priority`; //
    badge.appendChild(badgeText);

    const manipulateCard = document.createElement("div");
    manipulateCard.classList.add("kanban-manipulate-card");

    const cardTitle = document.createElement("p");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = title;
    manipulateCard.appendChild(cardTitle);

    const cardInfos = document.createElement("div");
    cardInfos.classList.add("card-infos");
    
    const cardIcons = document.createElement("div");
    cardIcons.classList.add("card-icons");

    const linkElement = document.createElement("p");
    const anchor = document.createElement("a");
    anchor.classList.add("icon-button");
    anchor.href = link;
    anchor.target = "_blank";

    // const icon = document.createElement("i");
    // icon.classList.add("fa-solid", "fa-paperclip");
    // anchor.appendChild(icon);
    // linkElement.appendChild(anchor);
    // cardIcons.appendChild(linkElement);

    // Create restore button
    const restoreButton = document.createElement("p");
    const restoreAnchor = document.createElement("button");
    restoreAnchor.classList.add("edit-button");
    const restoreIcon = document.createElement("i");
    restoreIcon.classList.add("fa-solid", "fa-rotate-left");
    restoreAnchor.appendChild(restoreIcon);
    restoreButton.appendChild(restoreAnchor);
    cardIcons.appendChild(restoreButton);
    restoreAnchor.onclick = (event) => {event.stopPropagation(); restoreCard(item_id);};

    // Create delete button
    const deleteButton = document.createElement("p");
    const deleteAnchor = document.createElement("button");
    deleteAnchor.classList.add("icon-button");
    deleteAnchor.onclick = (event) => {event.stopPropagation(); fullDeleteCards(item_id);}; // Pass the kanbanCard to delete function

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

    kanbanCard.addEventListener('click', (event) => {
        event.stopPropagation();
        openViewModal(item_id)
    });

    kanbanCards.appendChild(kanbanCard);
}





function deleteCard(item_id) {
    const cardElement = document.getElementById(item_id);
    if (cardElement) {
        cardElement.remove(); 
    } else {
        console.log(`Cartão não encontrado.`);
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

    card.querySelector(".card-title").textContent = title;

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