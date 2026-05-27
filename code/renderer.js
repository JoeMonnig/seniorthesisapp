const API = window.api;

async function handleRegister() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    const result = await API.registerUser({ username, password });

    if (result.success) {
        alert("Account created! Please login.");
        window.location.href = "login.html";
    } else {
        alert(result.message || "Registration failed");
    }
}

window.handleRegister = handleRegister;