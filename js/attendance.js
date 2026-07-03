
/* =========================
   DATE-WISE WORK HISTORY
========================= */

const DAILY_TARGET_SECONDS = 8 * 60 * 60;

function getDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getWorkHistory() {
    return JSON.parse(localStorage.getItem("attendanceWorkHistory")) || {};
}

function saveWorkHistory(history) {
    localStorage.setItem(
        "attendanceWorkHistory",
        JSON.stringify(history)
    );
}

function getLoginHistory() {
    return JSON.parse(localStorage.getItem("attendanceLoginHistory")) || {};
}

function saveLoginHistory(history) {
    localStorage.setItem(
        "attendanceLoginHistory",
        JSON.stringify(history)
    );
}

function saveTodayWorkSeconds(seconds) {
    const history = getWorkHistory();

    history[getDateKey()] = seconds;

    saveWorkHistory(history);
}

function getTodayWorkedSeconds() {
    const history = getWorkHistory();

    return history[getDateKey()] || 0;
}


/* =========================
   WEEKLY WORKING HOURS CHART
========================= */

const ctx = document.getElementById("attendanceChart");
let attendanceChart;

function getWeekDates() {
    const today = new Date();
    const day = today.getDay();

    // Monday as first day of the work week
    const mondayOffset = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const weekDates = [];

    for (let i = 0; i < 6; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDates.push(date);
    }

    return weekDates;
}

function getWeeklyHoursData() {
    const history = getWorkHistory();
    const weekDates = getWeekDates();

    return weekDates.map(date => {
        const seconds = history[getDateKey(date)] || 0;
        return Number((seconds / 3600).toFixed(2));
    });
}

function createAttendanceChart() {
    if (!ctx || typeof Chart === "undefined") {
        return;
    }

    attendanceChart = new Chart(ctx, {
        type: "bar",

        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

            datasets: [{
                label: "Hours Worked",
                data: getWeeklyHoursData(),
                borderRadius: 12,

                backgroundColor: [
                    "#4A7DFF",
                    "#55D6FF",
                    "#4A7DFF",
                    "#55D6FF",
                    "#4A7DFF",
                    "#E23A8E"
                ]
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,

                    grid: {
                        color: "#EEF2F7"
                    }
                },

                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function updateAttendanceChart() {
    if (!attendanceChart) {
        return;
    }

    attendanceChart.data.datasets[0].data =
        getWeeklyHoursData();

    attendanceChart.update();
}

createAttendanceChart();


/* =========================
   INSIGHTS (real values from stored history)
========================= */

function updateInsights() {

    const workHistory = getWorkHistory();
    const loginHistory = getLoginHistory();

    const workedDays =
        Object.keys(workHistory).filter(k => workHistory[k] > 0);

    let totalHours = 0;
    let overtimeHours = 0;

    workedDays.forEach(key => {
        const hrs = workHistory[key] / 3600;
        totalHours += hrs;
        if (hrs > 8) overtimeHours += (hrs - 8);
    });

    const avgHours = workedDays.length ? (totalHours / workedDays.length) : 0;

    // Streak: consecutive days up to today with recorded work time
    let streak = 0;
    const cursor = new Date();

    while (true) {
        const key = getDateKey(cursor);
        if (workHistory[key] && workHistory[key] > 0) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        } else {
            break;
        }
    }

    // Average login time across recorded logins
    const loginKeys = Object.keys(loginHistory);
    let avgLoginText = "--:--";

    if (loginKeys.length) {
        const totalMinutes = loginKeys.reduce((sum, key) => {
            const d = new Date(loginHistory[key]);
            return sum + d.getHours() * 60 + d.getMinutes();
        }, 0);

        const avgMinutes = Math.round(totalMinutes / loginKeys.length);
        const h = Math.floor(avgMinutes / 60);
        const m = avgMinutes % 60;

        const displayHour = (h % 12 === 0) ? 12 : h % 12;
        const ampm = h >= 12 ? "PM" : "AM";

        avgLoginText =
            `${String(displayHour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
    }

    const avgLoginEl = document.getElementById("avgLoginInsight");
    const streakEl = document.getElementById("streakInsight");
    const avgHoursEl = document.getElementById("avgHoursInsight");
    const overtimeEl = document.getElementById("overtimeInsight");

    if (avgLoginEl) avgLoginEl.textContent = avgLoginText;
    if (streakEl) streakEl.textContent = `${streak} Day${streak === 1 ? "" : "s"}`;
    if (avgHoursEl) avgHoursEl.textContent = `${avgHours.toFixed(1)}h`;
    if (overtimeEl) overtimeEl.textContent = `${Math.round(overtimeHours)}h`;
}


/* =========================
   CURRENT WORK SESSION
========================= */

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginTime = document.getElementById("loginTime");
const sessionTime = document.getElementById("sessionTime");

const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");

const attendanceProgressRing =
    document.getElementById("attendanceProgressRing");

const attendancePercent =
    document.getElementById("attendancePercent");

const goalText = document.getElementById("goalText");

let sessionInterval = null;


/* Converts seconds to: 02h 15m */

function formatSessionTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return (
        String(hours).padStart(2, "0") +
        "h " +
        String(minutes).padStart(2, "0") +
        "m"
    );
}


/* Updates progress ring */

function updateProgress(elapsedSeconds) {
    let percentage = Math.floor(
        (elapsedSeconds / DAILY_TARGET_SECONDS) * 100
    );

    if (percentage > 100) {
        percentage = 100;
    }

    attendancePercent.textContent = percentage + "%";

    goalText.textContent =
        formatSessionTime(elapsedSeconds) +
        " worked out of 8 hrs";

    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    const offset =
        circumference - (percentage / 100) * circumference;

    attendanceProgressRing.style.strokeDasharray = circumference;
    attendanceProgressRing.style.strokeDashoffset = offset;
}


/* Updates timer, history and chart */

function updateSession() {
    const loginTimestamp =
        Number(localStorage.getItem("attendanceLoginTimestamp"));

    if (!loginTimestamp) {
        return;
    }

    const elapsedSeconds = Math.floor(
        (Date.now() - loginTimestamp) / 1000
    );

    sessionTime.textContent =
        formatSessionTime(elapsedSeconds);

    updateProgress(elapsedSeconds);

    // Used by To Do page Hours Worked card
    localStorage.setItem("workSeconds", elapsedSeconds);

    // Saves current day's hours for the weekly chart
    saveTodayWorkSeconds(elapsedSeconds);

    // Updates the weekly chart live
    updateAttendanceChart();
    renderAttendanceCalendar();
    updateInsights();
}


/* Login state */

function showLoggedInState() {
    const loginTimestamp =
        Number(localStorage.getItem("attendanceLoginTimestamp"));

    const loginDate = new Date(loginTimestamp);

    loginTime.textContent =
        loginDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    statusText.textContent = "Logged In";

    loginBtn.disabled = true;
    logoutBtn.disabled = false;

    statusDot.classList.add("active");

    updateSession();

    clearInterval(sessionInterval);

    sessionInterval = setInterval(() => {
        updateSession();
    }, 1000);
}


/* Logout state */

function showLoggedOutState() {

    const todayWorkedSeconds = getTodayWorkedSeconds();

    statusText.textContent = "Not Logged In";

    loginTime.textContent = "--:--";

    sessionTime.textContent =
        formatSessionTime(todayWorkedSeconds);

    loginBtn.disabled = false;
    logoutBtn.disabled = true;

    statusDot.classList.remove("active");

    updateProgress(todayWorkedSeconds);

    updateAttendanceChart();
    renderAttendanceCalendar();
    updateInsights();
}


/* Login */

loginBtn.addEventListener("click", () => {
    const now = Date.now();

    localStorage.setItem(
        "attendanceLoginTimestamp",
        now
    );

    localStorage.setItem("attendanceLoggedIn", "true");

    localStorage.setItem("workSeconds", "0");

    const loginHistory = getLoginHistory();
    loginHistory[getDateKey()] = now;
    saveLoginHistory(loginHistory);

    showLoggedInState();
});


/* Logout */

logoutBtn.addEventListener("click", () => {
    clearInterval(sessionInterval);

    const loginTimestamp =
        Number(localStorage.getItem("attendanceLoginTimestamp"));

    if (loginTimestamp) {
        const elapsedSeconds = Math.floor(
            (Date.now() - loginTimestamp) / 1000
        );

        saveTodayWorkSeconds(elapsedSeconds);
    }

    localStorage.removeItem(
        "attendanceLoginTimestamp"
    );

    localStorage.setItem(
        "attendanceLoggedIn",
        "false"
    );

    updateAttendanceChart();
    renderAttendanceCalendar();
    showLoggedOutState();
});


/* Restore session after page refresh */
const calendarGrid = document.getElementById("calendarGrid");

const calendarMonthYear =
    document.getElementById("calendarMonthYear");

const prevMonthBtn =
    document.getElementById("prevMonthBtn");

const nextMonthBtn =
    document.getElementById("nextMonthBtn");

let selectedCalendarDate = new Date();


const isLoggedIn =
    localStorage.getItem("attendanceLoggedIn") === "true";

if (isLoggedIn) {
    showLoggedInState();
} else {
    showLoggedOutState();
}

/* =========================
   MONTHLY ATTENDANCE CALENDAR
========================= */



function getCalendarDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function renderAttendanceCalendar() {

    if (!calendarGrid || !calendarMonthYear) return;

    const year = selectedCalendarDate.getFullYear();
    const month = selectedCalendarDate.getMonth();

    const today = new Date();
    const history = getWorkHistory();

    calendarMonthYear.textContent =
        new Date(year, month).toLocaleString("default", {
            month: "long",
            year: "numeric"
        });

    calendarGrid.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Empty cells before first date
    for (let i = 0; i < firstDay; i++) {

        const empty = document.createElement("div");
        empty.className = "empty";

        calendarGrid.appendChild(empty);
    }

    // Dates
    for (let day = 1; day <= totalDays; day++) {

        const cell = document.createElement("div");

        cell.className = "calendar-date";

        cell.textContent = day;

        const dateKey = getCalendarDateKey(year, month, day);

        const currentDate = new Date(year, month, day);

        const isToday =
            currentDate.toDateString() === today.toDateString();

        const isFuture =
            currentDate >
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );

        if (history[dateKey] && history[dateKey] > 0) {
            cell.classList.add("present-day");
        }

        if (isToday) {
            cell.classList.add("today-day");
        }

        if (isFuture) {
            cell.classList.add("future-day");
        }

        calendarGrid.appendChild(cell);
    }
}

prevMonthBtn.addEventListener("click", () => {

    selectedCalendarDate.setMonth(
        selectedCalendarDate.getMonth() - 1
    );

    renderAttendanceCalendar();
});

nextMonthBtn.addEventListener("click", () => {

    selectedCalendarDate.setMonth(
        selectedCalendarDate.getMonth() + 1
    );

    renderAttendanceCalendar();
});

document.addEventListener("DOMContentLoaded", () => {

    renderAttendanceCalendar();

});