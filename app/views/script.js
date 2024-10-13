const apiUrl = 'http://localhost:8000/tasks/task'; // Set base URL to /tasks

// Função para listar todas as tasks
function getTasks() {
    $.ajax({
        url: apiUrl.replace(/\/task$/, ''), // Fetching from /tasks directly
        type: 'GET',
        success: function(tasks) {
            const taskList = $('#tasks');
            taskList.empty();

            tasks.forEach(task => {
                const taskItem = $(`
                    <div class="task-item">
                        <h3>${task.title}</h3>
                        <p><strong>Type:</strong> ${task.type}</p>
                        <p><strong>Description:</strong> ${task.description}</p>
                        <p><strong>Status:</strong> ${task.status}</p>
                        <div class="task-actions">
                            <button onclick="deleteTask('${task.id}')">Delete</button>
                            <button onclick="updateTask('${task.id}')">Update</button>
                        </div>
                    </div>
                `);
                taskList.append(taskItem);
            });
        }
    });
}

// Função para adicionar uma nova task
function addTask(event) {
    event.preventDefault();

    const title = $('#title').val();
    const type = $('#type').val();
    const description = $('#description').val();
    const status = $('#status').val();

    $.ajax({
        url: `${apiUrl}/post`, // Updated to match the route
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ title, type, description, status }),
        success: function() {
            $('#taskForm')[0].reset();
            getTasks();
        }
    });
}

// Função para deletar uma task
function deleteTask(id) {
    console.log(id);
    $.ajax({
        url: `${apiUrl}/delete?item_id=${id}`, // Pass ID as a query parameter
        type: 'DELETE',
        contentType: 'application/json', // Ensure the content type is set
        success: function() {
            getTasks();
        },
        error: function(err) {
            console.error('Error deleting task:', err);
        }
    });
}

// Função para atualizar uma task (popula formulário para edição)
function updateTask(id) {
    const title = prompt('Enter new title');
    const type = prompt('Enter new type');
    const description = prompt('Enter new description');
    const status = prompt('Enter new status');

    $.ajax({
        url: `${apiUrl}/update?item_id=${id}`, // Pass ID as a query parameter
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ title, type, description, status }), // Ensure all necessary fields are sent
        success: function() {
            getTasks();
        },
        error: function(err) {
            console.error('Error updating task:', err);
        }
    });
}

// Event listener para o formulário de adição de tasks
$('#taskForm').submit(addTask);

// Inicializa o carregamento da lista de tasks
getTasks();
