/* =========================================================================
   SEARCH.JS
   Lightweight, functional search for every page of the portal.
   Filters the relevant on-screen items as the user types — no page
   reload, no backend required. Which elements are searched depends on
   which page is active (set via <body data-page="...">).
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("searchInput");
    if (!input) return;

    const page = document.body.dataset.page;
    const noResultsEl = document.getElementById("searchNoResults");

    /* Selectors describing what counts as a "searchable item" per page */
    const pageSelectors = {
        home: ".searchable",
        attendance: ".searchable",
        leave: ".searchable, #leaveHistoryBody tr",
        todo: ".task-card"
    };

    const selector = pageSelectors[page];
    if (!selector) return;

    function runSearch() {

        const query = input.value.trim().toLowerCase();
        const items = document.querySelectorAll(selector);

        let visibleCount = 0;

        items.forEach(item => {

            // Never hide/count a table's own "empty state" placeholder row
            if (item.querySelector && item.querySelector(".empty-state")) {
                return;
            }

            const text = item.textContent.toLowerCase();
            const matches = query === "" || text.includes(query);

            item.style.display = matches ? "" : "none";

            if (matches) visibleCount++;
        });

        if (noResultsEl) {
            noResultsEl.hidden = !(query !== "" && visibleCount === 0);
        }
    }

    input.addEventListener("input", runSearch);

    /* Press Escape inside the search box to clear it quickly */
    input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            input.value = "";
            runSearch();
            input.blur();
        }
    });

    /* Re-run search after dynamic content changes (new task added, new
       leave submitted, recent activity refreshed, etc.) so filtering
       stays accurate without the user retyping */
    const contentArea = document.querySelector(".content");

    if (contentArea && window.MutationObserver) {
        const observer = new MutationObserver(() => {
            if (input.value.trim() !== "") runSearch();
        });

        observer.observe(contentArea, { childList: true, subtree: true });
    }
});
