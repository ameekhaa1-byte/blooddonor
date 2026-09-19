/* =====================================
   BLOODCONNECT
   FIREBASE + FIRESTORE + ADMIN
===================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    getAuth,
    signInAnonymously,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
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
   ADMIN EMAIL
===================================== */

/*
   Replace the text below with the email
   you created in Firebase Authentication.

   DO NOT put your password here.
*/

const ADMIN_EMAIL = "ameekhaa1@gmail.com";


/* =====================================
   INITIALIZE FIREBASE
===================================== */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const donorsCollection =
    collection(db, "donors");


/* =====================================
   LOCAL DATA
===================================== */

let donors = [];

let isAdmin = false;


/* =====================================
   GET DONORS
===================================== */

function getDonors() {

    return donors;

}


/* =====================================
   START FIREBASE
===================================== */

async function startFirebase() {

    try {

        if (!auth.currentUser) {

            await signInAnonymously(auth);

        }

        startDonorListener();

    }

    catch (error) {

        console.error(
            "Firebase authentication error:",
            error
        );

        alert(
            "Could not connect to BloodConnect."
        );

    }

}


/* =====================================
   AUTHENTICATION STATE
===================================== */

onAuthStateChanged(
    auth,
    function(user) {

        if (user && user.email) {

            isAdmin =
                user.email.toLowerCase() ===
                ADMIN_EMAIL.toLowerCase();

        }

        else {

            isAdmin = false;

        }

        updateAdminUI();

        refreshCurrentDonorList();

    }
);


/* =====================================
   ADMIN LOGIN
===================================== */

async function adminLogin() {

    const email =
        prompt("Enter admin email:");

    if (!email) {

        return;

    }


    const password =
        prompt("Enter admin password:");

    if (!password) {

        return;

    }


    try {

        await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
        );


        isAdmin = true;


        updateAdminUI();

        refreshCurrentDonorList();


        alert(
            "Admin login successful."
        );

    }

    catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        alert(
            "Admin login failed. Check your email and password."
        );

    }

}


/* =====================================
   ADMIN LOGOUT
===================================== */

async function adminLogout() {

    try {

        await signOut(auth);

        isAdmin = false;

        updateAdminUI();

        refreshCurrentDonorList();


        alert(
            "Admin logged out."
        );


        /*
         * Sign in anonymously again so normal
         * website functions continue working.
         */

        await signInAnonymously(auth);

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}


/* =====================================
   ADMIN BUTTON
===================================== */

function updateAdminUI() {

    let adminButton =
        document.getElementById(
            "adminButton"
        );


    if (!adminButton) {

        adminButton =
            document.createElement("button");

        adminButton.id =
            "adminButton";

        adminButton.className =
            "admin-btn";


        const nav =
            document.querySelector(
                ".navbar nav"
            );


        if (nav) {

            nav.appendChild(
                adminButton
            );

        }

    }


    if (isAdmin) {

        adminButton.textContent =
            "Admin Logout";

        adminButton.onclick =
            adminLogout;

    }

    else {

        adminButton.textContent =
            "Admin Login";

        adminButton.onclick =
            adminLogin;

    }

}


/* =====================================
   FIRESTORE LISTENER
===================================== */

function startDonorListener() {

    onSnapshot(

        donorsCollection,

        function(snapshot) {

            donors = [];


            snapshot.forEach(
                function(document) {

                    donors.push({

                        id: document.id,

                        ...document.data()

                    });

                }
            );


            updateStatistics();

            refreshCurrentDonorList();

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
   REFRESH CURRENT DONOR LIST
===================================== */

function refreshCurrentDonorList() {

    const activePage =
        document.querySelector(
            ".page.active"
        );


    if (!activePage) {

        return;

    }


    if (
        activePage.id === "groups"
    ) {

        const results =
            document.getElementById(
                "groupResults"
            );


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


    if (
        activePage.id === "find"
    ) {

        const results =
            document.getElementById(
                "findResults"
            );


        const select =
            document.getElementById(
                "findBloodGroup"
            );


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

}


/* =====================================
   PAGE NAVIGATION
===================================== */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(
        function(page) {

            page.classList.remove(
                "active"
            );

        }
    );


    const selectedPage =
        document.getElementById(
            pageId
        );


    if (selectedPage) {

        selectedPage.classList.add(
            "active"
        );

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
        document.getElementById(
            "mobileMenu"
        );


    if (menu) {

        menu.classList.toggle(
            "show"
        );

    }

}


function closeMenu() {

    const menu =
        document.getElementById(
            "mobileMenu"
        );


    if (menu) {

        menu.classList.remove(
            "show"
        );

    }

}


/* =====================================
   OPEN BLOOD GROUP
===================================== */

function openGroup(group) {

    showPage("groups");


    const results =
        document.getElementById(
            "groupResults"
        );


    if (results) {

        results.dataset.group =
            group;


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
        document.getElementById(
            "findBloodGroup"
        );


    const group =
        select.value;


    const results =
        document.getElementById(
            "findResults"
        );


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

function displayDonors(
    group,
    container
) {

    if (!container) {

        return;

    }


    container.dataset.group =
        group;


    const matchingDonors =
        getDonors().filter(
            function(donor) {

                return donor.bloodGroup === group;

            }
        );


    if (
        matchingDonors.length === 0
    ) {

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
                    registered with this blood group.
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


    matchingDonors.forEach(
        function(donor) {


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
                                '${donor.id}'
                            )">

                            ${recentText}

                        </button>


                        ${
                            isAdmin

                            ?

                            `

                            <button

                                class="recent-btn"

                                style="
                                    background:#8b0000;
                                    color:white;
                                "

                                onclick="deleteDonor(
                                    '${donor.id}'
                                )">

                                ✕ Remove

                            </button>

                            `

                            :

                            ""

                        }

                    </div>


                </div>

            `;

        }
    );


    html += `</div>`;


    container.innerHTML =
        html;

}


/* =====================================
   DELETE DONOR
===================================== */

async function deleteDonor(id) {

    if (!isAdmin) {

        alert(
            "Admin access required."
        );

        return;

    }


    const donor =
        getDonors().find(
            function(item) {

                return item.id === id;

            }
        );


    if (!donor) {

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to remove this donor?"
        );


    if (!confirmed) {

        return;

    }


    try {

        await deleteDoc(

            doc(
                db,
                "donors",
                id
            )

        );


        alert(
            "Donor removed successfully."
        );

    }

    catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "Could not remove this donor."
        );

    }

}


/* =====================================
   TOGGLE RECENT DONATION
===================================== */

async function toggleRecent(id) {

    const donor =
        getDonors().find(
            function(item) {

                return item.id === id;

            }
        );


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

function setupDonorForm() {

    const donorForm =
        document.getElementById(
            "donorForm"
        );


    if (!donorForm) {

        return;

    }


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

                lastDonation:
                    lastDonation,

                recentDonation:
                    recentDonation

            };


            try {

                await addDoc(
                    donorsCollection,
                    newDonor
                );


                donorForm.reset();


                alert(
                    "Registration successful!"
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
                    "Registration failed. Please try again."
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


    groups.forEach(
        function(group) {

            const count =
                getDonors().filter(
                    function(donor) {

                        return donor.bloodGroup === group;

                    }
                ).length;


            const safeGroup =
                group

                    .replace(
                        "+",
                        "-positive"
                    )

                    .replace(
                        "-",
                        "-negative"
                    );


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

        }
    );

}


/* =====================================
   HTML SAFETY
===================================== */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

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

window.deleteDonor =
    deleteDonor;

window.adminLogin =
    adminLogin;

window.adminLogout =
    adminLogout;


/* =====================================
   START WEBSITE
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateStatistics();

        showPage("home");

        setupDonorForm();

        updateAdminUI();

        startFirebase();

    }
);