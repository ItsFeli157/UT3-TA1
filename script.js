let taskIdCounter = 0; // Contador para generar IDs únicos

let currentTask = null; /*guarda tarea para editar*/

// Abrir y cerrar la ventana emergente de el boton agregar
function openAgregarModal() {
    document.getElementById('Agregar').style.display = 'block';
}

function closeAgregarModal() {
    document.getElementById('Agregar').style.display = 'none';
}

function openEditModal(taskElement) {
    currentTask = taskElement; // Guarda la referencia a la tarea actual
    document.getElementById('Editar').style.display = 'block';
    
    // Carga los datos en el formulario de edición
    document.getElementById('editTaskTitle').value = taskElement.querySelector('strong').innerText;
    document.getElementById('editTaskDescription').value = taskElement.querySelectorAll('p')[1].innerText;
    document.getElementById('editTaskAssigned').value = taskElement.querySelectorAll('p')[2].innerText.replace('Asignado a: ', '');
    document.getElementById('editTaskPriority').value = taskElement.getAttribute('data-priority');
    document.getElementById('editTaskDueDate').value = taskElement.getAttribute('data-deadline');
    document.getElementById('editTaskStatus').value = taskElement.closest('.column').getAttribute('data-status');
}

function closeEditModal() {
    document.getElementById('Editar').style.display = 'none';
    currentTask = null; // Limpia la referencia a la tarea actual
}

function validarTitulo(title) {
    const tituloError = document.getElementById("tituloError");
    if (title.trim() === "") {
        tituloError.textContent = "El título es obligatorio.";
        return false;
    } else {
        tituloError.textContent = "";
        return true;
    }
}

function addTask() { /*agregar tarea*/
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const assigned = document.getElementById('assigned').value;
    const priority = document.getElementById('priority').value;
    const status = document.getElementById('status').value;
    const deadline = document.getElementById('deadline').value;

    if (!validarTitulo(title)) {
        document.getElementById("resultado").textContent = "";
        return; // Evitar que se continúe si el título no es válido
    }

    const task = document.createElement('div');
    task.classList.add('task', priority); // Añadir prioridad
    task.setAttribute('draggable', 'true');
    task.setAttribute('data-priority', priority);
    task.setAttribute('data-deadline', deadline);

    // se fija que el id de la tarea sea único (que no se repita)
    taskIdCounter++;
    task.setAttribute('id', `task-${taskIdCounter}`);

    // drag
    task.ondragstart = drag;

    task.innerHTML = `
        <span class="close" onclick="deleteTask(${taskIdCounter})">&times;</span>
        <p class="task-title"><strong>${title}</strong></p>
        <p class="task-description">${description}</p>
        <p>Asignado a: ${assigned}</p>
        <p>Prioridad: ${priority}</p>
        <p>Fecha límite: ${deadline}</p>
    `;

    // Botón de edición
    const editButton = document.createElement('button');
    editButton.innerText = 'Editar';
    editButton.classList.add('edit-button');
    editButton.onclick = function() {
        openEditModal(task);
    };
    task.appendChild(editButton);

    document.querySelector(`.column[data-status="${status}"] .task-container`).appendChild(task);

    // Ordenar tareas por fecha de vencimiento
    ordenarPorFecha(status);
    
    closeAgregarModal();
    
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('assigned').value = '';
    document.getElementById('priority').value = '';
    document.getElementById('status').value = '';
    document.getElementById('deadline').value = '';
}


function deleteTask(taskId) {
    const taskElement = document.getElementById(`task-${taskId}`);
    if (taskElement) {
        taskElement.remove();
    }
}

function editTask() {
    if (currentTask) {
        // Actualiza los valores de la tarea
        currentTask.querySelector('strong').innerText = document.getElementById('editTaskTitle').value;
        currentTask.querySelectorAll('p')[1].innerText = document.getElementById('editTaskDescription').value;
        currentTask.querySelectorAll('p')[2].innerText = 'Asignado a: ' + document.getElementById('editTaskAssigned').value;
        currentTask.setAttribute('data-priority', document.getElementById('editTaskPriority').value);
        currentTask.setAttribute('data-deadline', document.getElementById('editTaskDueDate').value);

        // Actualizar la fecha en la visualización de la tarea
        const deadlineElement = currentTask.querySelectorAll('p')[4]; // Asume que es el cuarto párrafo
        deadlineElement.innerText = 'Fecha límite: ' + document.getElementById('editTaskDueDate').value;

        const newStatus = document.getElementById('editTaskStatus').value;
        const newContainer = document.querySelector(`.column[data-status="${newStatus}"] .task-container`);
        newContainer.appendChild(currentTask); // Mueve la tarea si el estado ha cambiado

        // Reordenar las tareas por fecha de vencimiento
        ordenarPorFecha(newStatus);
    }

    // Cierra el modal de edición
    closeEditModal();
}





function allowDrop(event) { /*drag and drop*/
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();

    let taskId;
    if (event.type === "drop") {
        taskId = event.dataTransfer.getData("text");
    } else if (event.type === "touchend") {
        taskId = event.target.id; // Aquí usamos `event.target.id` directamente
    }

    if (!taskId) return;

    const taskElement = document.getElementById(taskId);
    const targetColumn = event.target.closest('.column').querySelector('.task-container');

    if (taskElement && targetColumn) {
        targetColumn.appendChild(taskElement);

        /* Mantener el color de prioridad */
        const priority = taskElement.getAttribute('data-priority');
        taskElement.classList.remove('low', 'medium', 'high');
        taskElement.classList.add(priority);

        /* Ordenar por fecha */
        const status = targetColumn.closest('.column').dataset.status;
        ordenarPorFecha(status);
    }
}


function ordenarPorFecha(status) {
    const column = document.querySelector(`[data-status="${status}"] .task-container`);
    const tasks = Array.from(column.children);

    tasks.sort((a, b) => {
        const dateA = new Date(a.getAttribute('data-due-date'));
        const dateB = new Date(b.getAttribute('data-due-date'));
        return dateA - dateB;
    });

    tasks.forEach(task => column.appendChild(task));
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    
    const btn = document.getElementById("darkModeToggle");
    if (document.body.classList.contains("dark-mode")) {
        btn.textContent = "Modo Claro"; // Cambia el texto del botón a "Modo Claro" cuando el modo oscuro está activado
    } else {
        btn.textContent = "Modo Oscuro"; // Cambia el texto del botón a "Modo Oscuro" cuando el modo claro está activado
    }
}

function drag(event) {
    if (event.type === "touchstart") {
        event.dataTransfer = event.target;
    } else {
        event.dataTransfer.setData("text", event.target.id);
    }
}

document.querySelectorAll('.task').forEach(task => {
    task.addEventListener('dragstart', drag);
    task.addEventListener('touchstart', drag); // Añadir soporte para dispositivos móviles
});

document.querySelectorAll('.task-container').forEach(container => {
    container.addEventListener('dragover', allowDrop);
    container.addEventListener('drop', drop);
    container.addEventListener('touchend', drop); // Añadir soporte para dispositivos móviles
});


function updateTaskInDOM(taskElement) {
    let newStatus = taskElement.getAttribute('data-status');
    let column = document.querySelector(`.column[data-status="${newStatus}"] .task-container`);
    column.appendChild(taskElement); // Mueve la tarea a la nueva columna
}

//-------------------------------------------------------------------
const API_URL = "http://localhost:3000/api/tasks";

// Obtener tareas desde el backend al cargar la página
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        tasks.forEach(task => {
            renderTask(task);
        });
    } catch (error) {
        console.error("Error al obtener las tareas:", error);
    }
}

//Renderizar una tarea en el DOM
function renderTask(task) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task', task.priority); 
    taskElement.setAttribute('draggable', 'true');
    taskElement.setAttribute('data-priority', task.priority);
    taskElement.setAttribute('data-deadline', task.endDate);
    taskElement.setAttribute('id', `task-${task.id}`);

    taskElement.innerHTML = `
        <span class="close" onclick="deleteTask('${task.id}')">&times;</span>
        <p class="task-title"><strong>${task.title}</strong></p>
        <p class="task-description">${task.description}</p>
        <p>Asignado a: ${task.assignedTo}</p>
        <p>Prioridad: ${task.priority}</p>
        <p>Fecha límite: ${task.endDate}</p>
    `;

    const editButton = document.createElement('button');
    editButton.innerText = 'Editar';
    editButton.classList.add('edit-button');
    editButton.onclick = function() {
        openEditModal(taskElement);
    };
    taskElement.appendChild(editButton);

    document.querySelector(`.column[data-status="${task.status}"] .task-container`).appendChild(taskElement);
    ordenarPorFecha(task.status);
}

//Agregar nueva tarea al backend
async function addTask() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const assigned = document.getElementById('assigned').value;
    const priority = document.getElementById('priority').value;
    const status = document.getElementById('status').value;
    const deadline = document.getElementById('deadline').value;

    if (!validarTitulo(title)) {
        document.getElementById("resultado").textContent = "";
        return;
    }

    const newTask = {
        title,
        description,
        assignedTo: assigned,
        priority,
        status,
        endDate: deadline,
        startDate: new Date().toISOString().split('T')[0] 
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        const createdTask = await response.json();
        renderTask(createdTask); 
        closeAgregarModal();

    } catch (error) {
        console.error("Error al crear la tarea:", error);
    }
}

// Editar tarea en el backend
async function editTask() {
    if (!currentTask) return;

    const taskId = currentTask.getAttribute('id').replace('task-', '');
    const updatedTask = {
        title: document.getElementById('editTaskTitle').value,
        description: document.getElementById('editTaskDescription').value,
        assignedTo: document.getElementById('editTaskAssigned').value,
        priority: document.getElementById('editTaskPriority').value,
        endDate: document.getElementById('editTaskDueDate').value,
        status: document.getElementById('editTaskStatus').value
    };

    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask)
        });

        const updatedTaskFromBackend = await response.json();
        updateTaskInDOM(updatedTaskFromBackend); // Reflejar los cambios en el DOM

    } catch (error) {
        console.error("Error al editar la tarea:", error);
    }

    closeEditModal();
}

// Eliminar tarea del backend
async function deleteTask(taskId) {
    try {
        await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
        document.getElementById(`task-${taskId}`).remove();
    } catch (error) {
        console.error("Error al eliminar la tarea:", error);
    }
}                                                  
// Inicializar las tareas al cargar la página
window.onload = fetchTasks;