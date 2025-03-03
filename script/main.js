// LOGIN FUNCTION
function checkLogin() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if (user === "Manager" && pass === "Manager1234") {
        localStorage.setItem("isLoggedIn", "true");
        document.getElementById("loginModal").style.display = "none"; // Hide modal only on success

        // Clear username and password fields after successful login
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
    } else {
        alert("Invalid credentials!");
    }
}

// LOGOUT FUNCTION
function logout() {
    console.log("Logout function triggered!"); // Debug log
    localStorage.setItem("isLoggedIn", "false");
    document.getElementById("loginModal").style.display = "flex"; // Show login modal again
}

// CHECK LOGIN STATE ON PAGE LOAD
window.onload = function () {
    let isLoggedIn = localStorage.getItem("isLoggedIn");
    console.log("Login State on Load:", isLoggedIn); // Debug log

    if (isLoggedIn !== "true") {
        document.getElementById("loginModal").style.display = "flex";
    } else {
        document.getElementById("loginModal").style.display = "none";
    }
    loadNumbers();
};

// LIVE CLOCK FUNCTION
function updateClock() {
    let now = new Date();
    document.getElementById("clock").innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// NUMBER SAVING FUNCTION
function saveNumber() {
    let number = document.getElementById("userNumber").value;
    if (!number) {
        document.getElementById("message").innerText = "Please enter a number.";
        return;
    }

    let now = new Date();
    let timestamp = now.toLocaleString();

    let numbers = JSON.parse(localStorage.getItem("numbers")) || [];
    numbers.unshift({ number, timestamp });

    localStorage.setItem("numbers", JSON.stringify(numbers));
    document.getElementById("userNumber").value = "";
    loadNumbers();
}

// LOAD NUMBERS FUNCTION
function loadNumbers() {
    let numbers = JSON.parse(localStorage.getItem("numbers")) || [];
    let table = document.getElementById("dataTable");
    table.innerHTML = "";

    numbers.forEach(item => {
        let timestamp = new Date(item.timestamp);
        let minutes = timestamp.getMinutes();
        let number = parseInt(item.number, 10);
        let rowClass = "green";

        if (minutes >= 40 || (minutes > 35 && number >= 20)) {
            rowClass = "red";
        }

        let row = `<tr class="${rowClass}"><td>${number}</td><td>${item.timestamp}</td></tr>`;
        table.innerHTML += row;
    });
}

// SHOW SAVED DATA MODAL FUNCTION
function showSavedData() {
    let archivedNumbers = JSON.parse(localStorage.getItem("archivedNumbers")) || [];
    let table = document.getElementById("savedDataTable");
    table.innerHTML = "";

    if (archivedNumbers.length === 0) {
        table.innerHTML = "<tr><td colspan='2'>No archived data available.</td></tr>";
    } else {
        archivedNumbers.forEach(item => {
            let row = `<tr><td>${item.number}</td><td>${item.timestamp}</td></tr>`;
            table.innerHTML += row;
        });
    }

    document.getElementById("savedDataModal").style.display = "flex"; // Show modal
}

// CLOSE SAVED DATA MODAL FUNCTION
function closeSavedData() {
    document.getElementById("savedDataModal").style.display = "none";
}

// EXCEL DOWNLOAD FUNCTION
function downloadExcel() {
    clearNumbers(); 
    setTimeout(() => {
        let archivedNumbers = JSON.parse(localStorage.getItem("archivedNumbers")) || [];

        if (archivedNumbers.length === 0) {
            alert("No data to download.");
            return;
        }

        let now = new Date();
        let month = String(now.getMonth() + 1).padStart(2, '0');
        let day = String(now.getDate()).padStart(2, '0');
        let year = String(now.getFullYear()).slice(-2);

        let fileName = `Login_${month}${day}${year}.xlsx`;

        let wb = XLSX.utils.book_new();
        let formattedDate = `${month}/${day}/${now.getFullYear()}`;
        let combinedData = [[formattedDate], ["Number", "Timestamp"]];

        archivedNumbers.forEach(item => combinedData.push([item.number, item.timestamp]));

        let ws = XLSX.utils.aoa_to_sheet(combinedData);
        XLSX.utils.book_append_sheet(wb, ws, "Numbers");
        XLSX.writeFile(wb, fileName);

        localStorage.removeItem("archivedNumbers");
        logout();
    }, 100);
}

// CLEAR NUMBERS FUNCTION
function clearNumbers() {
    if (confirm("Are you sure you want to clear all saved numbers?")) {
        let numbers = JSON.parse(localStorage.getItem("numbers")) || [];
        let archivedNumbers = JSON.parse(localStorage.getItem("archivedNumbers")) || [];
        archivedNumbers = archivedNumbers.concat(numbers);
        localStorage.setItem("archivedNumbers", JSON.stringify(archivedNumbers));

        localStorage.removeItem("numbers");
        loadNumbers();
    }
}

// ENTER KEY EVENT FOR SUBMISSION
document.getElementById("userNumber").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        saveNumber();
    }
});

// AUTO-DOWNLOAD EXCEL AT 11 PM (HANDLES SLEEP MODE)
function checkTimeAndDownload() {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    let lastCheck = localStorage.getItem("lastCheckTime");
    let lastDownload = localStorage.getItem("excelDownloaded");

    // If it's 11:00 PM and the download hasn't happened
    if (hours === 23 && minutes === 0 && !lastDownload) {
        console.log("Auto-downloading Excel at 11:00 PM!");
        localStorage.setItem("excelDownloaded", "true"); // Mark as downloaded
        downloadExcel();

        // Close the web app after 5 seconds
        setTimeout(() => {
            window.close();
        }, 5000);
    }

    // HANDLE MISSED DOWNLOAD DUE TO SLEEP MODE
    if (lastCheck) {
        let lastCheckDate = new Date(lastCheck);
        let lastCheckHours = lastCheckDate.getHours();
        let lastCheckMinutes = lastCheckDate.getMinutes();

        // If the last check was before 11 PM and we missed it, trigger download
        if (lastCheckHours < 23 && hours >= 23 && !lastDownload) {
            console.log("System was asleep! Missed 11 PM, triggering download now.");
            localStorage.setItem("excelDownloaded", "true");
            downloadExcel();
            setTimeout(() => {
                window.close();
            }, 5000);
        }
    }

    // Update last check time
    localStorage.setItem("lastCheckTime", now);
}

// RESET DOWNLOAD FLAG AT MIDNIGHT
function resetDownloadFlag() {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    if (hours === 0 && minutes === 0) {
        localStorage.removeItem("excelDownloaded"); // Reset for the next day
        console.log("Download flag reset.");
    }
}

// Check every minute
setInterval(checkTimeAndDownload, 60000);
setInterval(resetDownloadFlag, 60000);

