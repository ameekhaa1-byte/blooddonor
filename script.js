/* =====================================
   BLOODCONNECT JAVASCRIPT
===================================== */


/* =====================================
   GET DONORS FROM BROWSER STORAGE
===================================== */

function getDonors() {

    const data = localStorage.getItem("bloodConnectDonors");

    if (!data) {
        return [];
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}


/* =====================================
   SAVE DONORS
===================================== */

function saveDonors(donors) {

    localStorage.setItem(
        "bloodConnectDonors",
        JSON.stringify(donors)
    );

}


/* =====================================
   PAGE NAVIGATION
===================================== */

function showPage(pageId) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {

        page.classList.remove("active");

    });


    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {

        selectedPage.classList.add("active");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    updateStatistics();

}


/* =====================================
   MOBILE MENU
===================================== */

function toggleMenu() {

    const menu =
        document.getElementById("mobileMenu");

    menu.classList.toggle("show");

}


function closeMenu() {

    const menu =
        document.getElementById("mobileMenu");

    menu.classList.remove("show");

}


/* =====================================
   BLOOD GROUP
===================================== */

function openGroup(group) {

    showPage("groups");

    const results =
        document.getElementById("groupResults");

    displayDonors(group, results);

}


/* =====================================
   FIND DONORS
===================================== */

function findDonors() {

    const group =
        document.getElementById("findBloodGroup").value;

    const results =
        document.getElementById("findResults");


    if (!group) {

        results.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🩸</div>
                <h3>Select a blood group</h3>
                <p>Please select a blood group first.</p>
            </div>
        `;

        return;

    }


    displayDonors(group, results);

}


/* =====================================
   DISPLAY DONORS
===================================== */

function displayDonors(group, container) {

    const donors = getDonors();


    const matchingDonors =
        donors.filter(function(donor) {

            return donor.bloodGroup === group;

        });


    if (matchingDonors.length === 0) {

        container.innerHTML = `

            <div class="results-title">

                <h2>
                    Donors with
                    <span>${group}</span>
                </h2>

            </div>

            <div class="empty-state">

                <div class="empty-icon">
                    🩸
                </div>

                <h3>
                    No registered donors yet
                </h3>

                <p>
                    There are currently no donors
                    registered with blood group ${group}.
                </p>

                <br>

                <button
                    class="primary-btn"
                    onclick="showPage('register')">

                    Become a Donor

                </button>

            </div>

        `;

        return;

    }


    let html = `

        <div class="results-title">

            <h2>
                Donors with
                <span>${group}</span>
            </h2>

            <p>
                ${matchingDonors.length}
                registered donor(s)
            </p>

        </div>

        <div class="donor-grid">

    `;


    matchingDonors.forEach(function(donor) {

        const recentClass =
            donor.recentDonation
                ? "active"
                : "";

        const recentText =
            donor.recentDonation
                ? "✓ Donated Recently"
                : "Mark as Donated Recently";


        html += `

            <div class="donor-card">

                <div class="donor-top">

                    <div class="donor-name">
                        ${escapeHTML(donor.name)}
                    </div>

                    <div class="blood-tag">
                        ${escapeHTML(donor.bloodGroup)}
                    </div>

                </div>


                <div class="donor-info">

                    <div>
                        📍
                        <strong>Location:</strong>
                        ${escapeHTML(donor.location)}
                    </div>

                    <div>
                        📞
                        <strong>Phone:</strong>
                        ${escapeHTML(donor.phone)}
                    </div>

                    ${
                        donor.lastDonation
                        ?
                        `
                        <div>
                            📅
                            <strong>Last donation:</strong>
                            ${escapeHTML(donor.lastDonation)}
                        </div>
                        `
                        :
                        ""
                    }

                </div>


                ${
                    donor.recentDonation
                    ?
                    `
                    <div class="form-note">
                        This donor marked themselves
                        as having donated recently.
                    </div>
                    `
                    :
                    ""
                }


                <div class="donor-actions">

                    <a
                        class="call-btn"
                        href="tel:${escapeHTML(donor.phone)}">

                        📞 Call Donor

                    </a>


                    <button
                        class="recent-btn ${recentClass}"
                        onclick="toggleRecent('${donor.id}', '${group}')">

                        ${recentText}

                    </button>

                </div>

            </div>

        `;

    });


    html += `</div>`;


    container.innerHTML = html;

}


/* =====================================
   TOGGLE RECENT DONATION
===================================== */

function toggleRecent(id, group) {

    const donors = getDonors();


    const donor =
        donors.find(function(item) {

            return item.id === id;

        });


    if (!donor) {
        return;
    }


    donor.recentDonation =
        !donor.recentDonation;


    saveDonors(donors);


    const currentPage =
        document.querySelector(".page.active");


    if (currentPage.id === "groups") {

        displayDonors(
            group,
            document.getElementById("groupResults")
        );

    } else {

        displayDonors(
            group,
            document.getElementById("findResults")
        );

    }


    updateStatistics();

}


/* =====================================
   REGISTER DONOR
===================================== */

document
    .getElementById("donorForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const name =
            document.getElementById("name").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const bloodGroup =
            document.getElementById("bloodGroup").value;

        const location =
            document.getElementById("location").value.trim();

        const lastDonation =
            document.getElementById("lastDonation").value;

        const recentDonation =
            document.getElementById("recentDonation").checked;


        if (
            !name ||
            !phone ||
            !bloodGroup ||
            !location
        ) {

            alert(
                "Please fill in all required fields."
            );

            return;

        }


        const donors = getDonors();


        const newDonor = {

            id:
                Date.now().toString(),

            name:
                name,

            phone:
                phone,

            bloodGroup:
                bloodGroup,

            location:
                location,

            lastDonation:
                lastDonation,

            recentDonation:
                recentDonation

        };


        donors.push(newDonor);


        saveDonors(donors);


        /* Clear form */

        document
            .getElementById("donorForm")
            .reset();


        /* Update website */

        updateStatistics();


        alert(
            "Registration successful! Your donor details have been added."
        );


        /* Open blood group */

        openGroup(bloodGroup);

    });


/* =====================================
   UPDATE STATISTICS
===================================== */

function updateStatistics() {

    const donors = getDonors();


    const donorCount =
        document.getElementById("donorCount");

    const availableCount =
        document.getElementById("availableCount");


    if (donorCount) {

        donorCount.textContent =
            donors.length;

    }


    if (availableCount) {

        const available =
            donors.filter(function(donor) {

                return !donor.recentDonation;

            });

        availableCount.textContent =
            available.length;

    }


    updateBloodGroupCounts();

}


/* =====================================
   BLOOD GROUP COUNTS
===================================== */

function updateBloodGroupCounts() {

    const donors = getDonors();


    const groups = [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
    ];


    groups.forEach(function(group) {

        const count =
            donors.filter(function(donor) {

                return donor.bloodGroup === group;

            }).length;


        const safeGroup =
            group
                .replace("+", "-positive")
                .replace("-", "-negative");


        const element =
            document.getElementById(
                "count-" + safeGroup
            );


        if (element) {

            element.textContent =
                count +
                (count === 1
                    ? " Donor"
                    : " Donors");

        }

    });

}


/* =====================================
   HTML SAFETY
===================================== */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =====================================
   START WEBSITE
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateStatistics();

        showPage("home");

    }
);
