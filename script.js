/* =====================================
   BLOODCONNECT JAVASCRIPT
   FIREBASE + FIRESTORE VERSION
===================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    getAuth,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


/* =====================================
   FIREBASE CONFIGURATION
===================================== */

const firebaseConfig = {

    apiKey: "AIzaSyCqXUHDHykloy51n8QTzpI59dRsAUjYbfE",

    authDomain: "bloodconnect-d72ee.firebaseapp.com",

    projectId: "bloodconnect-d72ee",

    storageBucket: "bloodconnect-d72ee.firebasestorage.app",

    messagingSenderId: "877909200543",

    appId: "1:877909200543:web:5ec235063ebaa2c3a65caa"

};


/* =====================================
   INITIALIZE FIREBASE
===================================== */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const donorsCollection = collection(db, "donors");


/* =====================================
   LOCAL MEMORY OF FIRESTORE DATA
===================================== */

let donors = [];


/* =====================================
   GET DONORS
===================================== */

function getDonors() {

    return donors;

}


/* =====================================
   FIREBASE ANONYMOUS LOGIN
===================================== */

async function startFirebase() {

    try {

        await signInAnonymously(auth);

        console.log("Firebase authentication successful.");

        startDonorListener();

    }

    catch (error) {

        console.error(
            "Firebase authentication error:",
            error
        );

        alert(
            "Could not connect to BloodConnect. Please try again."
        );

    }

}


/* =====================================
   LISTEN FOR DONOR CHANGES
===================================== */

function startDonorListener() {

    onSnapshot(

        donorsCollection,

        function(snapshot) {

            donors = [];

            snapshot.forEach(function(document) {

                donors.push({

                    id: document.id,

                    ...document.data()

                });

            });


            updateStatistics();


            /* Refresh currently displayed group */

            const activePage =
                document.querySelector(".page.active");


            if (
                activePage &&
                activePage.id === "groups"
            ) {

                const results =
                    document.getElementById("groupResults");

                if (
                    results &&
                    results.dataset.group
                ) {

                    displayDonors(
                        results.dataset.group,
                        results
                    );

                }

            }


            /* Refresh Find Donor page */

            if (
                activePage &&
                activePage.id === "find"
            ) {

                const results =
                    document.getElementById("findResults");

                const select =
                    document.getElementById("findBloodGroup");

                if (
                    results &&
                    select &&
                    select.value
                ) {

                    displayDonors(
                        select.value,
                        results
                    );

                }

            }

        },

        function(error) {

            console.error(
                "Firestore error:",
                error
            );

        }

    );

}


/* =====================================
   PAGE NAVIGATION
===================================== */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");


    pages.forEach(function(page) {

        page.classList.remove("active");

    });


    const selectedPage =
        document.getElementById(pageId);


    if (selectedPage) {

        selectedPage.classList.add("active");

    }


    closeMenu();


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


    if (menu) {

        menu.classList.toggle("show");

    }

}


function closeMenu() {

    const menu =
        document.getElementById("mobileMenu");


    if (menu) {

        menu.classList.remove("show");

    }

}


/* =====================================
   BLOOD GROUP
===================================== */

function openGroup(group) {

    showPage("groups");


    const results =
        document.getElementById("groupResults");


    if (results) {

        results.dataset.group = group;

        displayDonors(
            group,
            results
        );

    }

}


/* =====================================
   FIND DONORS
===================================== */

function findDonors() {

    const select =
        document.getElementById("findBloodGroup");


    const group =
        select.value;


    const results =
        document.getElementById("findResults");


    if (!group) {

        results.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🩸
                </div>

                <h3>
                    Select a blood group
                </h3>

                <p>
                    Please select a blood group first.
                </p>

            </div>

        `;

        return;

    }


    displayDonors(
        group,
        results
    );

}


/* =====================================
   DISPLAY DONORS
===================================== */

function displayDonors(group, container) {

    if (!container) {

        return;

    }


    container.dataset.group = group;


    const matchingDonors =
        getDonors().filter(function(donor) {

            return donor.bloodGroup === group;

        });


    if (matchingDonors.length === 0) {

        container.innerHTML = `

            <div class="results-title">

                <h2>
                    Donors with
                    <span>
                        ${escapeHTML(group)}
                    </span>
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
                    registered with blood group
                    ${escapeHTML(group)}.
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

                <span>
                    ${escapeHTML(group)}
                </span>

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

                        ${escapeHTML(
                            donor.name || ""
                        )}

                    </div>

                    <div class="blood-tag">

                        ${escapeHTML(
                            donor.bloodGroup || ""
                        )}

                    </div>

                </div>


                <div class="donor-info">

                    <div>

                        📍

                        <strong>
                            Location:
                        </strong>

                        ${escapeHTML(
                            donor.location || ""
                        )}

                    </div>


                    <div>

                        📞

                        <strong>
                            Phone:
                        </strong>

                        ${escapeHTML(
                            donor.phone || ""
                        )}

                    </div>


                    ${
                        donor.lastDonation

                        ?

                        `

                        <div>

                            📅

                            <strong>
                                Last donation:
                            </strong>

                            ${escapeHTML(
                                donor.lastDonation
                            )}

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
                        href="tel:${escapeHTML(
                            donor.phone || ""
                        )}">

                        📞 Call Donor

                    </a>


                    <button

                        class="recent-btn ${recentClass}"

                        onclick="toggleRecent(
                            '${donor.id}',
                            '${escapeHTML(group)}'
                        )">

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

async function toggleRecent(id, group) {

    const donor =
        getDonors().find(function(item) {

            return item.id === id;

        });


    if (!donor) {

        return;

    }


    try {

        await updateDoc(

            doc(
                db,
                "donors",
                id
            ),

            {

                recentDonation:
                    !donor.recentDonation

            }

        );

    }

    catch (error) {

        console.error(
            "Error updating donor:",
            error
        );


        alert(
            "Could not update donor status."
        );

    }

}


/* =====================================
   REGISTER DONOR
===================================== */

const donorForm =
    document.getElementById("donorForm");


if (donorForm) {

    donorForm.addEventListener(

        "submit",

        async function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();


            const bloodGroup =
                document
                    .getElementById("bloodGroup")
                    .value;


            const location =
                document
                    .getElementById("location")
                    .value
                    .trim();


            const lastDonation =
                document
                    .getElementById("lastDonation")
                    .value;


            const recentDonation =
                document
                    .getElementById("recentDonation")
                    .checked;


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


            const newDonor = {

                name: name,

                phone: phone,

                bloodGroup: bloodGroup,

                location: location,

                lastDonation: lastDonation,

                recentDonation: recentDonation

            };


            try {

                await addDoc(

                    donorsCollection,

                    newDonor

                );


                donorForm.reset();


                alert(
                    "Registration successful! " +
                    "Your donor details have been added."
                );


                openGroup(
                    bloodGroup
                );

            }

            catch (error) {

                console.error(
                    "Error adding donor:",
                    error
                );


                alert(
                    "Registration failed. " +
                    "Please try again."
                );

            }

        }

    );

}


/* =====================================
   UPDATE STATISTICS
===================================== */

function updateStatistics() {

    const donorList =
        getDonors();


    const donorCount =
        document.getElementById(
            "donorCount"
        );


    const availableCount =
        document.getElementById(
            "availableCount"
        );


    if (donorCount) {

        donorCount.textContent =
            donorList.length;

    }


    if (availableCount) {

        const available =
            donorList.filter(
                function(donor) {

                    return !donor.recentDonation;

                }
            );


        availableCount.textContent =
            available.length;

    }


    updateBloodGroupCounts();

}


/* =====================================
   BLOOD GROUP COUNTS
===================================== */

function updateBloodGroupCounts() {

    const donorList =
        getDonors();


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
            donorList.filter(
                function(donor) {

                    return donor.bloodGroup === group;

                }
            ).length;


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

                (
                    count === 1
                        ? " Donor"
                        : " Donors"
                );

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
   MAKE FUNCTIONS AVAILABLE TO HTML
===================================== */

window.showPage =
    showPage;

window.toggleMenu =
    toggleMenu;

window.closeMenu =
    closeMenu;

window.openGroup =
    openGroup;

window.findDonors =
    findDonors;

window.displayDonors =
    displayDonors;

window.toggleRecent =
    toggleRecent;


/* =====================================
   START WEBSITE
===================================== */

document.addEventListener(

    "DOMContentLoaded",

    function() {

        updateStatistics();

        showPage("home");

        startFirebase();

    }

);