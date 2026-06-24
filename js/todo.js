const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const addTaskBtn = document.getElementById("addTaskBtn");
const pendingColumn = document.getElementById("pendingColumn");
const completedColumn =
    document.getElementById("completedColumn");
const totalTasksCount =
    document.getElementById("totalTasksCount");

const completedTasksCount =
    document.getElementById("completedTasksCount");

const pendingTasksCount =
    document.getElementById("pendingTasksCount");
const taskDescription =
    document.getElementById("taskDescription");

addTaskBtn.addEventListener("click", () => {

    const title = taskInput.value.trim();
    const description =
        taskDescription.value.trim();
    const dueDate = taskDate.value;

    if (title === "" || description === "") {
        alert("Please enter title and description.");
        return;
    }

    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");
    taskCard.innerHTML = `
    <h3>${title}</h3>

   <p>
    ${description}
</p>

    <div class="task-footer">

        <span class="priority high">
            High Priority
        </span>

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
    updateStats();

    const deleteBtn =
        taskCard.querySelector(".delete-btn");

    deleteBtn.addEventListener("click", () => {

        taskCard.remove();
        updateStats();
    });
    const completeBtn =
        taskCard.querySelector(".complete-btn");

    completeBtn.addEventListener("click", () => {

        completeBtn.remove();

        taskCard.querySelector(".priority").textContent =
            "Completed";

        taskCard.querySelector(".priority").className =
            "priority low";

        completedColumn.appendChild(taskCard);
        updateStats();
    });
    taskInput.value = "";
    taskDate.value = "";
    taskDescription.value = "";
});
function updateStats() {

    const totalTasks =
        document.querySelectorAll(".task-card").length;

    const completedTasks =
        completedColumn.querySelectorAll(".task-card").length;

    const pendingTasks =
        totalTasks - completedTasks;

    totalTasksCount.textContent =
        totalTasks;

    completedTasksCount.textContent =
        completedTasks;

    pendingTasksCount.textContent =
        pendingTasks;
}
updateStats();

let draggedTask = null;

const taskCards =
    document.querySelectorAll(".task-card");

taskCards.forEach(card => {

    card.addEventListener("dragstart", () => {

        draggedTask = card;

        card.classList.add("dragging");

    });

    card.addEventListener("dragend", () => {

        card.classList.remove("dragging");

    });

});
const columns =
    document.querySelectorAll(".task-column");

columns.forEach(column => {

    column.addEventListener("dragover", (e) => {

        e.preventDefault();

    });

    column.addEventListener("drop", () => {

        if (draggedTask) {

            column.appendChild(draggedTask);

        }

    });

});