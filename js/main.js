const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");

const sessionBtn = document.getElementById("sessionBtn");
const timer = document.getElementById("work-timer");
const signinTime = document.getElementById("signin-time");
const targetTime = document.getElementById("target-time");
const sessionStatus = document.getElementById("sessionStatus");

let loginTimestamp = null;
let timerInterval = null;

/* FORMAT TIMER */

function formatTime(seconds) {

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return (
        String(hrs).padStart(2, "0") + ":" +
        String(mins).padStart(2, "0") + ":" +
        String(secs).padStart(2, "0")
    );
}

/* UPDATE PROGRESS BAR */

function updateProgress(elapsedSeconds) {

    const targetSeconds = 8 * 60 * 60; // 8 hrs

    let percent = Math.floor(
        (elapsedSeconds / targetSeconds) * 100
    );

    if (percent > 100) {
        percent = 100;
    }

    progressFill.style.width = percent + "%";
    progressPercent.textContent = percent + "%";
}

/* START TIMER */

function startTimer() {

    timerInterval = setInterval(() => {

        const elapsed =
            Math.floor((Date.now() - loginTimestamp) / 1000);

        timer.textContent =
            formatTime(elapsed);

        updateProgress(elapsed);

    }, 1000);
}

/* LOGIN / LOGOUT */

sessionBtn.addEventListener("click", () => {

    /* LOGIN */

    if (sessionBtn.textContent.trim() === "Login") {

        loginTimestamp = Date.now();

        const now = new Date();

        signinTime.textContent =
            now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

        const target = new Date(now);

        target.setHours(
            target.getHours() + 8
        );

        targetTime.textContent =
            target.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

        sessionBtn.textContent = "Logout";

        sessionStatus.textContent = "● Live";

        sessionStatus.style.color = "#16a34a";

        startTimer();
    }

    /* LOGOUT */

    else {

        clearInterval(timerInterval);

        sessionBtn.textContent = "Login";

        sessionStatus.textContent = "● Offline";

        sessionStatus.style.color = "#ef4444";

        timer.textContent = "00:00:00";

        signinTime.textContent = "--";

        targetTime.textContent = "--";

        progressFill.style.width = "0%";

        progressPercent.textContent = "0%";
    }
});