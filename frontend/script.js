const backEndUrl = 'http://54.219.225.136:8000/tasks';
let current_task = ''

function getJwtToken() {
    return localStorage.getItem('jwtToken'); 
}

function checkAuth() {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
        window.location.href = "http://54.219.225.136:80/login"; // Altere para a URL da sua página de login
    }
}

$(document).ready(function() {
    readTasks();
    readCompletedTasks();
    getJwtToken();
    checkAuth();
    $('#create-new-task-block').hide();
});


function setCurrentTaskId(taskId) {
    current_task =  taskId
}


function createTask() {
    var x = document.getElementById("inprogress");
    var y = document.getElementById("done");
    var z = document.getElementById("create-new-task-block");

    if (z.style.display === "none" || z.style.display === "") {
        z.style.display = "flex";
        x.style.display = "none";
        y.style.display = "none";
        document.getElementById("task-name").value = '';
        document.getElementById("task-description").value = '';
        document.getElementById("task-type").value = 'easy';
        document.getElementById("task-status").value = 'pending'; 
    } else {
        z.style.display = "none";
        x.style.display = "block";
        y.style.display = "block";
    }
}

function updateTaskModal() {
    var x = document.getElementById("inprogress");
    var y = document.getElementById("done");
    var z = document.getElementById("update-task-block");

    if (z.style.display === "none" || z.style.display === "") {
        z.style.display = "flex";
        x.style.display = "none";
        y.style.display = "none";
        document.getElementById("update-task-name").value = '';
        document.getElementById("update-task-description").value = '';
        document.getElementById("update-task-type").value = 'easy';
        document.getElementById("update-task-status").value = 'pending'; 
    } else {
        z.style.display = "none";
        x.style.display = "block";
        y.style.display = "block";
    }
}

function addTaskToBoard(task) {
    if (document.getElementById(task.id)) {
        return; 
    }

    var newTask = document.createElement("div");
    newTask.className = "task";
    newTask.draggable = true;
    newTask.id = task.id;
    newTask.ondragstart = function(event) { drag(event); };

    // Check the status of the task to determine the HTML content
    if (task.status === 'completed') {
        // Only show the title for done tasks
        newTask.innerHTML = `<span>${task.title}</span>`;
    } else {
        // Show title and buttons for other statuses
        newTask.innerHTML = `
            <span onclick="showTaskDetails('${task.id}')">${task.title}</span>
            <button onclick="deleteTask('${task.id}')" style="margin-left: 10px;">Remove</button>
            <button onclick="updateTaskModal(); setCurrentTaskId('${task.id}');" style="margin-left: 10px;">Edit</button>
        `;
    }

    // Append the new task to the appropriate status column
    if (task.status === 'in_progress') {
        document.getElementById("inprogress").appendChild(newTask);
    } else if (task.status === 'pending') {
        document.getElementById("todo").appendChild(newTask);
    } else if (task.status === 'completed') { // Ensure correct status handling
        document.getElementById("done").appendChild(newTask);
    }
}


function saveTask() {
    var taskName = document.getElementById("task-name").value;
    var taskDescription = document.getElementById("task-description").value;
    var taskType = document.getElementById("task-type").value;
    var taskStatus = document.getElementById("task-status").value;

    var taskData = {
        title: taskName,
        type: taskType,
        description: taskDescription,
        status: taskStatus
    };

    $.ajax({
        url: "http://54.219.225.136:8000/tasks/task/post",
        type: "POST",
        headers: {
            'Authorization': `Bearer ${getJwtToken() }`,
            'Accept': 'application/json'
        },
        contentType: "application/json",
        data: JSON.stringify(taskData),
        success: function(response) {
            console.log("Task saved successfully:", response);
            taskData.id = response.id; 
            addTaskToBoard(taskData);
            createTask();
            location.reload();
        },
        error: function(xhr, status, error) {
            console.error("Error saving task:", error);
        }
    });
}

function deleteTask(taskId) {
    $.ajax({
        url: `http://54.219.225.136:8000/tasks/task/delete?item_id=${taskId}`,
        type: "DELETE",
        headers: {
            'Authorization': `Bearer ${getJwtToken() }`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        success: function(response) {
            console.log("Task deleted successfully:", response);
            document.getElementById(taskId).remove();
        },
        error: function(xhr, status, error) {
            console.error("Error deleting task:", error);
        }
    });
}

function readTasks() {
    $.ajax({
        url: "http://54.219.225.136:8000/tasks/",
        type: "GET",
        headers: {
            'Authorization': `Bearer ${getJwtToken()}`,
            'Accept': 'application/json'
        },
        success: function(tasks) {
            tasks.forEach(function(task) {
                addTaskToBoard(task);
            });
        },
        error: function(xhr, status, error) {
            console.error("Error reading tasks:", error);
        }
    });
}

function readCompletedTasks() {
    $.ajax({
        url: "http://54.219.225.136:8000/tasks/completed",
        type: "GET",
        headers: {
            'Authorization': `Bearer ${getJwtToken() }`,
            'Accept': 'application/json'
        },
        success: function(tasks) {
            tasks.forEach(function(task) {
                addTaskToBoard(task);
            });
        },
        error: function(xhr, status, error) {
            console.error("Error reading tasks:", error);
        }
    });
}

function updateTaskDB() {
    var updateTaskName = document.getElementById("update-task-name").value;
    var updateTaskDescription = document.getElementById("update-task-description").value;
    var updateTaskType = document.getElementById("update-task-type").value;
    var updateTaskStatus = document.getElementById("update-task-status").value;

    var updateTaskData = {
        title: updateTaskName,
        type: updateTaskType,
        description: updateTaskDescription,
        status: updateTaskStatus
    };

    $.ajax({
        url: `http://54.219.225.136:8000/tasks/task/update?item_id=${current_task}`,
        type: "PUT",
        headers: {
            'Authorization': `Bearer ${getJwtToken() }`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(updateTaskData),
        success: function(response) {
            console.log("Task updated successfully:", response);
            location.reload();
        },
        error: function(xhr, status, error) {
            console.error("Error updating task:", error);
        }
    });
}

function showTaskDetails(taskId) {
    $.ajax({
        url: `http://54.219.225.136:8000/tasks/task?item_id=${taskId}`,
        type: "GET",
        headers: {
            'Authorization': `Bearer ${getJwtToken()}`,
            'Accept': 'application/json'
        },
        success: function(response) {
            // Assuming the response is a JSON string, parse it if necessary
            var task = typeof response === 'string' ? JSON.parse(response) : response;

            // Update modal details with task information
            $('#detail-title').text(task.title);
            $('#detail-description').text(task.description);
            $('#detail-type').text(task.type);
            $('#detail-status').text(task.status);
            $('#task-detail-modal').show();
        },
        error: function(xhr, status, error) {
            console.error("Error getting task details:", error);
        }
    });
}

function closeModal() {
    $('#task-detail-modal').hide();
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    event.target.appendChild(document.getElementById(data));
}
