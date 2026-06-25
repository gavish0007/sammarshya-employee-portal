const taskInput = document.getElementById("taskInput");
const taskDescription = document.getElementById("taskDescription");
const taskDate = document.getElementById("taskDate");
const addTaskBtn = document.getElementById("addTaskBtn");

const pendingColumn = document.getElementById("pendingColumn");
const completedColumn = document.getElementById("completedColumn");
const inProgressColumn = document.querySelectorAll(".task-column")[1];

const totalTasksCount = document.getElementById("totalTasksCount");
const completedTasksCount = document.getElementById("completedTasksCount");
const pendingTasksCount = document.getElementById("pendingTasksCount");

let draggedTask = null;


/* ADD DRAG FUNCTIONALITY TO A TASK CARD */

function makeTaskDraggable(taskCard) {
    taskCard.setAttribute("draggable", "true");

    taskCard.addEventListener("dragstart", () => {
        draggedTask = taskCard;
        taskCard.classList.add("dragging");
    });

    taskCard.addEventListener("dragend", () => {
        taskCard.classList.remove("dragging");
        draggedTask = null;
    });
}


/* ADD COMPLETE + DELETE BUTTON EVENTS */

function addTaskActions(taskCard) {
    const deleteBtn = taskCard.querySelector(".delete-btn");
    const completeBtn = taskCard.querySelector(".complete-btn");

    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            taskCard.remove();
            updateStats();
            updateProductivity();
        });
    }

    if (completeBtn) {
        completeBtn.addEventListener("click", () => {
            completeBtn.remove();

            const priority = taskCard.querySelector(".priority");

            priority.textContent = "Completed";
            priority.className = "priority low";

            const dueDate = taskCard.querySelector(".due-date");
            dueDate.textContent = "Done";

            completedColumn.appendChild(taskCard);

            updateStats();
            updateProductivity();
        });
    }
}


/* CREATE NEW TASK */

addTaskBtn.addEventListener("click", () => {
    const title = taskInput.value.trim();
    const description = taskDescription.value.trim();
    const dueDate = taskDate.value;

    if (title === "" || description === "") {
        alert("Please enter task title and description.");
        return;
    }

    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");

    taskCard.innerHTML = `
        <h3>${title}</h3>

        <p>${description}</p>

        <div class="task-footer">
            <span class="priority high">High Priority</span>

            <span class="due-date">
                ${dueDate || "No Date"}
            </span>
        </div>

        <div class="task-actions">
            <button class="complete-btn">
                <i class="fa-solid fa-check"></i>
                Complete
            </button>

            <button class="delete-btn">
                <i class="fa-solid fa-trash"></i>
                Delete
            </button>
        </div>
    `;

    pendingColumn.appendChild(taskCard);

    makeTaskDraggable(taskCard);
    addTaskActions(taskCard);

    taskInput.value = "";
    taskDescription.value = "";
    taskDate.value = "";

    updateStats();
    updateProductivity();
});


/* DRAG AND DROP COLUMNS */

const columns = document.querySelectorAll(".task-column");

columns.forEach(column => {
    column.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    column.addEventListener("drop", () => {
        if (draggedTask) {
            column.appendChild(draggedTask);

            updateStats();
            updateProductivity();
        }
    });
});


/* UPDATE TOP STATISTICS */

function updateStats() {
    const totalTasks = document.querySelectorAll(".task-card").length;

    const completedTasks =
        completedColumn.querySelectorAll(".task-card").length;

    const pendingTasks = totalTasks - completedTasks;

    totalTasksCount.textContent = totalTasks;
    completedTasksCount.textContent = completedTasks;
    pendingTasksCount.textContent = pendingTasks;
}


/* UPDATE PRODUCTIVITY SECTION */

function updateProductivity() {
    const pendingTasks =
        pendingColumn.querySelectorAll(".task-card").length;

    const inProgressTasks =
        inProgressColumn.querySelectorAll(".task-card").length;

    const completedTasks =
        completedColumn.querySelectorAll(".task-card").length;

    const totalTasks =
        pendingTasks + inProgressTasks + completedTasks;

    const pendingAndProgress =
        pendingTasks + inProgressTasks;

    let efficiency = 0;

    if (totalTasks > 0) {
        efficiency = Math.round(
            (completedTasks / totalTasks) * 100
        );
    }

    document.getElementById("completedMetric").textContent =
        completedTasks;

    document.getElementById("pendingMetric").textContent =
        pendingAndProgress;

    document.getElementById("efficiencyMetric").textContent =
        efficiency + "%";

    document.getElementById("efficiencyPercent").textContent =
        efficiency + "%";

    const ring = document.getElementById("productivityRing");

    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    const offset =
        circumference - (efficiency / 100) * circumference;

    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
}


/* GET WORK HOURS FROM HOME PAGE */

function updateHoursWorked() {
    const savedSeconds =
        Number(localStorage.getItem("workSeconds")) || 0;

    const hours = Math.floor(savedSeconds / 3600);

    const minutes = Math.floor(
        (savedSeconds % 3600) / 60
    );

    document.getElementById("hoursWorkedMetric").textContent =
        `${hours}h ${String(minutes).padStart(2, "0")}m`;
}


/* MAKE EXISTING TASKS WORK */

const existingTaskCards =
    document.querySelectorAll(".task-card");

existingTaskCards.forEach(taskCard => {
    makeTaskDraggable(taskCard);
    addTaskActions(taskCard);
});


/* INITIAL PAGE UPDATE */

updateStats();
updateProductivity();
updateHoursWorked();