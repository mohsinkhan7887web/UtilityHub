document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("toolSearch");
    const searchResult = document.getElementById("searchResult");

    const toolCards = document.querySelectorAll(".tool-card");
    const categoryCards = document.querySelectorAll(".category-card");

    const noToolsMessage = document.getElementById("noToolsMessage");
    const viewAllButton = document.getElementById("viewAllTools");

    const mobileMenuButton = document.querySelector(".mobile-menu");
    const navigation = document.querySelector(".navigation");

    const comingSoonLinks = document.querySelectorAll(".coming-soon");


    // ==========================================
    // SEARCH TOOLS
    // ==========================================

    if (searchInput) {

        searchInput.addEventListener("input", function () {

            const query = searchInput.value
                .toLowerCase()
                .trim();

            let found = 0;

            toolCards.forEach(function (card) {

                const toolName = card.dataset.name || "";
                const cardText = card.textContent.toLowerCase();

                if (
                    query === "" ||
                    toolName.includes(query) ||
                    cardText.includes(query)
                ) {
                    card.style.display = "";
                    found++;
                } else {
                    card.style.display = "none";
                }

            });


            if (query === "") {

                searchResult.textContent = "";

            } else if (found === 0) {

                searchResult.textContent = "No tools found.";

            } else {

                searchResult.textContent =
                    found +
                    (found === 1 ? " tool found" : " tools found");

            }


            if (noToolsMessage) {
                noToolsMessage.hidden = found !== 0;
            }

        });


        // ==========================================
        // ENTER KEY → JUMP TO TOOL
        // ==========================================

        searchInput.addEventListener("keydown", function (event) {

            if (event.key !== "Enter") {
                return;
            }

            event.preventDefault();

            const query = searchInput.value
                .toLowerCase()
                .trim();

            if (query === "") {
                return;
            }


            // Find the first matching tool

            let firstMatch = null;

            toolCards.forEach(function (card) {

                if (firstMatch !== null) {
                    return;
                }

                const toolName =
                    (card.dataset.name || "").toLowerCase();

                const cardText =
                    card.textContent.toLowerCase();

                if (
                    toolName.includes(query) ||
                    cardText.includes(query)
                ) {
                    firstMatch = card;
                }

            });


            // If a tool was found → jump to it

            if (firstMatch) {

                // Make sure the matching card is visible
                firstMatch.style.display = "";

                // Scroll directly to the tool card
                firstMatch.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                // Small highlight effect
                firstMatch.classList.add("search-highlight");

                setTimeout(function () {
                    firstMatch.classList.remove("search-highlight");
                }, 1800);

            }

        });

    }


    // ==========================================
    // CATEGORY FILTER
    // ==========================================

    categoryCards.forEach(function (categoryCard) {

        categoryCard.addEventListener("click", function (event) {

            event.preventDefault();

            const selectedCategory =
                categoryCard.dataset.category;

            let found = 0;

            toolCards.forEach(function (card) {

                const cardCategory =
                    card.dataset.category;

                if (cardCategory === selectedCategory) {

                    card.style.display = "";
                    found++;

                } else {

                    card.style.display = "none";

                }

            });


            if (searchInput) {
                searchInput.value = "";
            }

            if (searchResult) {

                searchResult.textContent =
                    found +
                    (found === 1 ? " tool found" : " tools found");

            }


            if (noToolsMessage) {
                noToolsMessage.hidden = found !== 0;
            }


            const toolsSection =
    document.getElementById("toolGrid");

            if (toolsSection) {

                toolsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    // ==========================================
    // VIEW ALL TOOLS
    // ==========================================

    if (viewAllButton) {

        viewAllButton.addEventListener("click", function () {

            toolCards.forEach(function (card) {
                card.style.display = "";
            });

            if (searchInput) {
                searchInput.value = "";
            }

            if (searchResult) {
                searchResult.textContent = "";
            }

            if (noToolsMessage) {
                noToolsMessage.hidden = true;
            }

        });

    }


    // ==========================================
    // COMING SOON TOOLS
    // ==========================================

    comingSoonLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            const toolName =
                link.dataset.tool || "This tool";

            alert(
                toolName +
                " is coming soon. We are building it next!"
            );

        });

    });


    // ==========================================
    // MOBILE MENU
    // ==========================================

    if (mobileMenuButton && navigation) {

        mobileMenuButton.addEventListener("click", function () {

            navigation.classList.toggle("mobile-open");

        });


        const navigationLinks =
            navigation.querySelectorAll("a");

        navigationLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                navigation.classList.remove("mobile-open");

            });

        });

    }

});