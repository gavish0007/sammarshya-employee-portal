// ===============================
// ELEMENTS
// ===============================

const leaveType = document.getElementById("leaveType");
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const leaveReason = document.getElementById("leaveReason");

const submitLeaveBtn =
    document.getElementById("submitLeaveBtn");

const leaveHistoryBody =
    document.getElementById("leaveHistoryBody");

// =========================
// LEAVE BALANCE
// =========================

const DEFAULT_BALANCE = {

    casual: 10,

    sick: 5,

    earned: 12

};

// ===============================
// LOCAL STORAGE
// ===============================

function getLeaves() {

    return JSON.parse(
        localStorage.getItem("leaveRequests")
    ) || [];

}

function saveLeaves(leaves) {

    localStorage.setItem(
        "leaveRequests",
        JSON.stringify(leaves)
    );

}

function getBalance() {

    const saved =
        JSON.parse(localStorage.getItem("leaveBalance"));

    if (saved) {

        return saved;

    }

    localStorage.setItem(
        "leaveBalance",
        JSON.stringify(DEFAULT_BALANCE)
    );

    return { ...DEFAULT_BALANCE };

}

function saveBalance(balance) {

    localStorage.setItem(

        "leaveBalance",

        JSON.stringify(balance)

    );

}
// ===============================
// CALCULATE DAYS
// ===============================

function calculateDays(start, end) {

    const from = new Date(start);
    const to = new Date(end);

    const diff =
        to.getTime() - from.getTime();

    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;

}


// ===============================
// DISPLAY LEAVES
// ===============================

function displayLeaves() {

    const leaves = getLeaves();

    leaveHistoryBody.innerHTML = "";

    leaves.forEach((leave, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `

<td>${leave.type}</td>

<td>${leave.from}</td>

<td>${leave.to}</td>

<td>${leave.days}</td>

<td>

<span class="status ${leave.status.toLowerCase()}">

${leave.status}

</span>

</td>

<td class="action-buttons">

<button
class="approve-btn"
data-index="${index}">

Approve

</button>

<button
class="reject-btn"
data-index="${index}">

Reject

</button>

<button
class="delete-btn"
data-index="${index}">

Delete

</button>

</td>

`;

        leaveHistoryBody.appendChild(row);

    });

    updateAnalytics();

}


// ===============================
// SUBMIT LEAVE
// ===============================

submitLeaveBtn.addEventListener("click", () => {

    if (

        leaveType.value === "" ||

        fromDate.value === "" ||

        toDate.value === "" ||

        leaveReason.value.trim() === ""

    ) {

        alert("Please fill all fields.");

        return;

    }

    if (fromDate.value > toDate.value) {

        alert("From Date cannot be after To Date.");

        return;

    }

    const leaves = getLeaves();

    leaves.push({

        type: leaveType.value,

        from: fromDate.value,

        to: toDate.value,

        reason: leaveReason.value,

        days: calculateDays(
            fromDate.value,
            toDate.value
        ),

        status: "Pending"

    });

    saveLeaves(leaves);

    displayLeaves();
    renderCalendar();

    leaveType.value = "";

    fromDate.value = "";

    toDate.value = "";

    leaveReason.value = "";

});


// ===============================
// DELETE REQUEST
// ===============================

leaveHistoryBody.addEventListener("click", (e) => {

    const index = e.target.dataset.index;

    if (index === undefined) return;

    const leaves = getLeaves();

    // APPROVE

    if (e.target.classList.contains("approve-btn")) {

        if (leaves[index].status !== "Approved") {

            const balance = getBalance();

            const days = Number(leaves[index].days);

            if (leaves[index].type === "Casual Leave") {

                balance.casual =
                    Math.max(0, balance.casual - days);

            }

            else if (leaves[index].type === "Sick Leave") {

                balance.sick =
                    Math.max(0, balance.sick - days);

            }

            else {

                balance.earned =
                    Math.max(0, balance.earned - days);

            }

            saveBalance(balance);

        }

        leaves[index].status = "Approved";

    }

    // REJECT

    else if (e.target.classList.contains("reject-btn")) {

        leaves[index].status = "Rejected";

    }

    // DELETE

    else if (e.target.classList.contains("delete-btn")) {

        leaves.splice(index, 1);

    }

    saveLeaves(leaves);

    displayLeaves();
    renderCalendar();

});

// ===============================
// ANALYTICS
// ===============================

function updateAnalytics() {

    const leaves = getLeaves();

    const approved =
        leaves.filter(l => l.status === "Approved").length;

    const pending =
        leaves.filter(l => l.status === "Pending").length;

    const rejected =
        leaves.filter(l => l.status === "Rejected").length;

    const used =
        approved + pending + rejected;

    document.getElementById("approvedCount").textContent =
        approved;

    document.getElementById("pendingCount").textContent =
        pending;

    document.getElementById("rejectedCount").textContent =
        rejected;

    document.getElementById("usedLeavesCount").textContent =
        used;

}
function updateBalanceCards() {

    const balance = getBalance();

    document.getElementById("casualBalance").textContent =
        balance.casual;

    document.getElementById("sickBalance").textContent =
        balance.sick;

    document.getElementById("earnedBalance").textContent =
        balance.earned;

    document.getElementById("totalBalance").textContent =

        balance.casual +

        balance.sick +

        balance.earned;

}

// ===============================
// INITIAL LOAD
// ===============================
// =========================
// LEAVE CALENDAR
// =========================

// =========================
// LEAVE CALENDAR
// =========================

let currentCalendarDate = new Date();

function renderCalendar() {

    const grid =
        document.getElementById("leaveCalendarGrid");

    const monthTitle =
        document.getElementById("calendarMonthYear");

    grid.innerHTML = "";

    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();

    monthTitle.textContent =
        currentCalendarDate.toLocaleString("default", {
            month: "long",
            year: "numeric"
        });

    const firstDay =
        new Date(year, month, 1).getDay();

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    // Empty cells
    for (let i = 0; i < firstDay; i++) {

        const empty =
            document.createElement("div");

        empty.className = "empty";

        grid.appendChild(empty);
    }

    const leaves = getLeaves();

    // Days
    for (let day = 1; day <= daysInMonth; day++) {

        const cell =
            document.createElement("div");

        cell.textContent = day;

        const currentDate =
            new Date(year, month, day);

        const dateString =
            currentDate.toISOString().split("T")[0];

        const leave =
            leaves.find(l =>
                dateString >= l.from &&
                dateString <= l.to
            );

        if (leave) {

            if (leave.status === "Approved") {

                cell.classList.add("leave-approved");

            } else if (leave.status === "Pending") {

                cell.classList.add("leave-pending");

            } else {

                cell.classList.add("leave-rejected");
            }
        }

        grid.appendChild(cell);
    }
}


// =========================
// CALENDAR BUTTONS
// =========================

document
    .getElementById("prevMonthBtn")
    .addEventListener("click", () => {

        currentCalendarDate.setMonth(
            currentCalendarDate.getMonth() - 1
        );

        renderCalendar();

    });


document
    .getElementById("nextMonthBtn")
    .addEventListener("click", () => {

        currentCalendarDate.setMonth(
            currentCalendarDate.getMonth() + 1
        );

        renderCalendar();

    });


// ===============================
// INITIAL LOAD
// ===============================

displayLeaves();

updateAnalytics();

updateBalanceCards();

renderCalendar();