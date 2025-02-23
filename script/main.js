// LOGIN FUNCTION
function checkLogin() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if (user === "Manager" && pass === "Manager1234") {
        localStorage.setItem("isLoggedIn", "true");
        document.getElementById("loginModal").style.display = "none";
        
        // Clear username and password fields after successful login
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
    } else {
        alert("Invalid credentials!");
    }
}


// LOGOUT FUNCTION
// LOGOUT FUNCTION
function logout() {
    localStorage.setItem("isLoggedIn", "false"); // Set login state to false
    document.getElementById("loginModal").style.display = "flex"; // Show login modal again
}


// CHECK LOGIN STATE ON PAGE LOAD
window.onload = function () {
    if (localStorage.getItem("isLoggedIn") !== "true") {
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
        let rowClass = minutes >= 35 ? "red" : "green";

        let row = `<tr class="${rowClass}"><td>${item.number}</td><td>${item.timestamp}</td></tr>`;
        table.innerHTML += row;
    });
}

// EXCEL DOWNLOAD FUNCTION
function downloadExcel() {
    let numbers = JSON.parse(localStorage.getItem("numbers")) || [];
    if (numbers.length === 0) {
        alert("No data to download.");
        return;
    }

    let now = new Date();
    let month = String(now.getMonth() + 1).padStart(2, '0');
    let day = String(now.getDate()).padStart(2, '0');
    let year = String(now.getFullYear()).slice(-2);
    let hour = String(now.getHours()).padStart(2, '0');

    let fileName = `Login_${month}${day}${year}${hour}.xlsx`;

    let wb = XLSX.utils.book_new();
    let ws_data = [["Number", "Timestamp"]];

    numbers.forEach(item => {
        ws_data.push([item.number, item.timestamp]);
    });

    let ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Numbers");
    XLSX.writeFile(wb, fileName);
}

// CLEAR NUMBERS FUNCTION
function clearNumbers() {
    if (confirm("Are you sure you want to clear all saved numbers?")) {
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
