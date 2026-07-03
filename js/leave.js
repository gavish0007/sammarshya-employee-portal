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

    if (leaves.length === 0) {

        const emptyRow = document.createElement("tr");

        emptyRow.innerHTML = `
            <td colspan="6" class="empty-state">
                No leave requests yet. Apply for leave using the form above.
            </td>
        `;

        leaveHistoryBody.appendChild(emptyRow);

        updateAnalytics();

        return;
    }

    leaves.forEach((leave, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `

<td data-label="Leave Type">${leave.type}</td>

<td data-label="From">${leave.from}</td>

<td data-label="To">${leave.to}</td>

<td data-label="Days">${leave.days}</td>

<td data-label="Status">

<span class="status ${leave.status.toLowerCase()}">

${leave.status}

</span>

</td>

<td data-label="Action" class="action-cell">

<div class="action-buttons">

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

</div>

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
    renderRecentActivity();

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
    renderRecentActivity();
    updateBalanceCards();

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

    updateLeaveProgressRing();

}

// ===============================
// LEAVE PROGRESS RING (days used vs total allotted)
// ===============================

function updateLeaveProgressRing() {

    const ring = document.getElementById("leaveProgressRing");
    const percentLabel = document.getElementById("leaveUsedPercent");

    if (!ring || !percentLabel) return;

    const totalAllotted =
        DEFAULT_BALANCE.casual +
        DEFAULT_BALANCE.sick +
        DEFAULT_BALANCE.earned;

    const balance = getBalance();

    const remaining =
        balance.casual + balance.sick + balance.earned;

    const usedDays = Math.max(0, totalAllotted - remaining);

    let percent = Math.round((usedDays / totalAllotted) * 100);

    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;

    percentLabel.textContent = percent + "%";

    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    const offset =
        circumference - (percent / 100) * circumference;

    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
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
// EXPORT LEAVE HISTORY (CSV)
// ===============================

function exportLeaveHistory() {

    const leaves = getLeaves();

    if (leaves.length === 0) {
        alert("There are no leave requests to export yet.");
        return;
    }

    const header = ["Leave Type", "From", "To", "Days", "Status"];

    const rows = leaves.map(l => [l.type, l.from, l.to, l.days, l.status]);

    const csvContent = [header, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `leave-history-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

const exportLeaveBtn = document.getElementById("exportLeaveBtn");

if (exportLeaveBtn) {
    exportLeaveBtn.addEventListener("click", exportLeaveHistory);
}

// ===============================
// RECENT ACTIVITY (derived from real leave requests)
// ===============================

const activityIcons = {
    Approved: { icon: "✔", cls: "approved-act" },
    Pending: { icon: "⏳", cls: "pending-act" },
    Rejected: { icon: "✖", cls: "rejected-act" }
};

function renderRecentActivity() {

    const list = document.getElementById("recentActivityList");

    if (!list) return;

    const leaves = getLeaves();

    if (leaves.length === 0) {
        list.innerHTML =
            `<p class="empty-state">No activity yet. Submit a leave request to get started.</p>`;
        return;
    }

    const recent = leaves.slice(-3).reverse();

    list.innerHTML = recent.map(leave => {

        const meta = activityIcons[leave.status] || activityIcons.Pending;

        return `
            <div class="activity-item ${meta.cls} searchable">
                ${meta.icon} ${leave.type} ${leave.status}
            </div>
        `;

    }).join("");
}

// ===============================
// INITIAL LOAD
// ===============================

displayLeaves();

updateAnalytics();

updateBalanceCards();

renderCalendar();

renderRecentActivity();