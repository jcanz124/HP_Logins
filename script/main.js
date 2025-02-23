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
        let number = parseInt(item.number, 10); // Ensure number is treated as an integer
        let rowClass = "green"; // Default green

        // Condition for red: If minutes >= 35 OR (minutes > 30 and number >= 20)
        if (minutes >= 35 || (minutes > 30 && number >= 20)) {
            rowClass = "red";
        }

        let row = `<tr class="${rowClass}"><td>${number}</td><td>${item.timestamp}</td></tr>`;
        table.innerHTML += row;
    });
}


// EXCEL DOWNLOAD FUNCTION
function downloadExcel() {
    let numbers = JSON.parse(localStorage.getItem("numbers")) || [];
    let archivedNumbers = JSON.parse(localStorage.getItem("archivedNumbers")) || [];

    if (numbers.length === 0 && archivedNumbers.length === 0) {
        alert("No data to download.");
        return;
    }

    let now = new Date();
    let month = String(now.getMonth() + 1).padStart(2, '0');
    let day = String(now.getDate()).padStart(2, '0');
    let year = String(now.getFullYear()).slice(-2);

    let fileName = `Login_${month}${day}${year}.xlsx`; // Removed hour

    let wb = XLSX.utils.book_new();

    // Format the date as a title
    let formattedDate = `${month}/${day}/${now.getFullYear()}`;
    let combinedData = [[formattedDate], ["Number", "Timestamp"]]; // First row = date, second row = headers

    // Append archived numbers first
    archivedNumbers.forEach(item => {
        combinedData.push([item.number, item.timestamp]);
    });

    // Append ongoing numbers
    numbers.forEach(item => {
        combinedData.push([item.number, item.timestamp]);
    });

    let ws = XLSX.utils.aoa_to_sheet(combinedData);

    // Merge the first row for the date title
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

    // Style the date title (optional)
    ws["A1"].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: "center" } };

    XLSX.utils.book_append_sheet(wb, ws, "Numbers");

    // Generate Excel File
    XLSX.writeFile(wb, fileName);
}



// CLEAR NUMBERS FUNCTION
function clearNumbers() {
    if (confirm("Are you sure you want to clear all saved numbers?")) {
        let numbers = JSON.parse(localStorage.getItem("numbers")) || [];
        
        // Save numbers to "archivedNumbers"
        let archivedNumbers = JSON.parse(localStorage.getItem("archivedNumbers")) || [];
        archivedNumbers = archivedNumbers.concat(numbers);
        localStorage.setItem("archivedNumbers", JSON.stringify(archivedNumbers));

        // Clear only the table, not the saved data
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
