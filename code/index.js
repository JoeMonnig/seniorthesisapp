const db = require("../db.js");

let wantsNeedsChart;
let recurringChart;
let allExpensesChart;

window.addEventListener(

    "DOMContentLoaded",

    async()=>{

        try{

    // Window Loading
    window.onload=()=>{
        const user = localStorage.getItem("loggedInUser");

        if(!user){
            window.location.href = "login.html";
            return;

        }

        const parsedUser = JSON.parse(user);

        document.getElementById("welcome").innerText = `Welcome, ${parsedUser.username}`;

        populateYearFilter();

        loadPrebuiltNames();

        loadExpenses();

        loadCharts();

        // Filter Events
        document.getElementById("monthFilter").onchange = ()=>{
            loadExpenses();

            loadCharts();

        };

        document.getElementById("yearFilter").onchange = ()=>{
            loadExpenses();

            loadCharts();

        };

        // Add Expense Button
        document.getElementById("addExpenseButton").onclick = addExpense;

    };

    // Prebuilt Names
    function loadPrebuiltNames(){

        const select = document.getElementById("prebuiltSelect");

        select.innerHTML = `<option value="">-- Select --</option>`;

        db.all(`SELECT PrebuiltNames.*, Types.typeName FROM PrebuiltNames
            LEFT JOIN Types
            ON PrebuiltNames.typeId=Types.typeid
            `,
            [],

            (err,rows)=>{

                if(err){
                    console.error(err.message);
                    return;

                }

                rows.forEach(row=>{
                    const option = document.createElement("option");
                    option.value = row.nameid;
                    option.textContent = row.name;

                    // Important data attributes for auto-filling fields
                    option.dataset.name = row.name;
                    option.dataset.description = row.description || "";
                    option.dataset.type = row.typeName || "";

                    select.appendChild(option);

                });

            }
        );

        // Prebuilt Name Selection Changing
        select.onchange=()=>{

            const selected = select.selectedOptions[0];

            // Reset fields if empty
            if(!selected.value){
                document.getElementById("expenseName").value = "";
                document.getElementById("expenseDescription").value = "";
                document.getElementById("expenseType").value = "income";
                return;

            }

            // Automatically fill in fields based on selection
            document.getElementById("expenseName").value = selected.dataset.name || "";
            document.getElementById("expenseDescription").value = selected.dataset.description || "";
            document.getElementById("expenseType").value = selected.dataset.type || "income";

        };
    }

    // Populate Year Filter
    function populateYearFilter(){
        const yearSelect = document.getElementById("yearFilter");
        const currentYear = new Date().getFullYear();

        for(let i = currentYear-5; i <= currentYear+5; i++){
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            yearSelect.appendChild(option);

        }

    }

    // Add Expense
    function addExpense(){
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        const name = document.getElementById("expenseName").value.trim();
        const description = document.getElementById("expenseDescription").value.trim();
        const type = document.getElementById("expenseType").value;
        const dueDate = document.getElementById("expenseDueDate").value;
        const payDate = document.getElementById("expensePayDate").value;
        const amount = parseFloat(document.getElementById("expenseAmount").value);

        if (!name){
            alert("Please enter an expense name.");
            return;

        }

        if (isNaN(amount)){
            alert("Please enter an amount.");
            return;

        }

        db.get(`SELECT typeid FROM Types
            WHERE typeName=?
            `,
            [type],

            (err,typeRow)=>{
                if (err){
                    console.error(err.message);
                    return;

                }

                if (!typeRow){
                    alert("Type not found.");
                    return;

                }

                db.run(`INSERT INTO Expenses
                    (
                        userId,
                        typeId,
                        name,
                        description,
                        duedate,
                        paydate,
                        amount
                    )
                    VALUES
                    (?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        user.usersid,
                        typeRow.typeid,
                        name,
                        description,
                        dueDate,
                        payDate,
                        amount
                    ],

                    function(err){

                        if (err){
                            console.error(err.message);
                            alert("Expense could not be added.");
                            return;

                        }

                        alert("Expense added.");
                        clearInputs();
                        loadExpenses();
                        loadCharts();
                        showTablePage();

                    }
                );
            }
        );
    }

    // Clearing Inputs
    function clearInputs(){
        document.getElementById("expenseName").value = "";
        document.getElementById("expenseDescription").value = "";
        document.getElementById("expenseDueDate").value = "";
        document.getElementById("expensePayDate").value = "";
        document.getElementById("expenseAmount").value = "";
        document.getElementById("prebuiltSelect").value = "";

    }

    // Load Expenses
    function loadExpenses(){
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        const selectedMonth = document.getElementById("monthFilter").value;
        const selectedYear = document.getElementById("yearFilter").value;
        const body = document.getElementById("expenseTableBody");

        body.innerHTML = "";

        db.all(`SELECT Expenses.*, Types.typeName FROM Expenses
            LEFT JOIN Types
            ON Expenses.typeId=Types.typeid

            WHERE Expenses.userId=?
            `,
            [user.usersid],

            (err,rows)=>{

                if (err){
                    console.error(err.message);
                    return;

                }

                rows.forEach(row=>{

                    if (row.duedate){
                        const date = new Date(row.duedate);
                        const rowMonth = date.getMonth();
                        const rowYear = date.getFullYear();

                        if (selectedMonth !== "all" && rowMonth != selectedMonth){
                            return;

                        }

                        if (selectedYear !== "all" && rowYear != selectedYear){
                            return;

                        }

                    }

                    const tr = document.createElement("tr");

                    tr.innerHTML = `
                        <td>${row.name}</td>
                        <td>${row.typeName}</td>
                        <td>$${row.amount}</td>
                        <td>${row.duedate||"-"}</td>
                        <td>
                            <button onclick="editExpense(${row.expenseid})">
                                Edit
                            </button>
                        </td>
                    `;

                    body.appendChild(tr);

                });
            }
        );
    }

    // Load Charts
    function loadCharts(){
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        const selectedMonth = document.getElementById("monthFilter").value;
        const selectedYear = document.getElementById("yearFilter").value;

        db.all(`SELECT Expenses.name, Expenses.amount, Expenses.duedate, Types.typeName FROM Expenses
            LEFT JOIN Types
            ON Expenses.typeId=Types.typeid
            WHERE Expenses.userId=?`,
            [user.usersid],

            (err,rows)=>{

                if (err){
                    console.error(err.message);
                    return;

                }

                let wants = 0;
                let needs = 0;

                let recurring = 0;
                let oneTime = 0;

                let expenseTotals = {};

                rows.forEach(row=>{

                    if (row.duedate){
                        const date = new Date(row.duedate);
                        const rowMonth = date.getMonth();
                        const rowYear = date.getFullYear();

                        if (selectedMonth !== "all" && rowMonth != selectedMonth){
                            return;

                        }

                        if (selectedYear !== "all" && rowYear != selectedYear){
                            return;

                        }

                    }

                    const amount = parseFloat(row.amount) || 0;

                    const type = row.typeName;

                    const expenseName = row.name || "Unknown";

                    if (type.includes("want")){
                        wants += amount;

                    }

                    if (type.includes("need")){
                        needs += amount;

                    }

                    if (type.includes("recurring")){
                        recurring += amount;

                    }

                    if (type.includes("one-time")){
                        oneTime += amount;

                    }

                    if (!expenseTotals[expenseName]){
                        expenseTotals[expenseName] = 0;

                    }

                    expenseTotals[expenseName] += amount;

                });

                // Destroy existing charts
                if (wantsNeedsChart){
                    wantsNeedsChart.destroy();

                }

                if (recurringChart){
                    recurringChart.destroy();

                }

                if (allExpensesChart){
                    allExpensesChart.destroy();

                }

                // All Expenses Pie Chart
                const expenseLabels = Object.keys(expenseTotals);
                const expenseData = Object.values(expenseTotals);

                const allExpensesCtx = document.getElementById("allExpensesChart");

                if(allExpensesCtx){
                    const ctx = allExpensesCtx.getContext("2d");

                }

                allExpensesChart = new Chart(allExpensesCtx,
                    {
                        type:"pie",

                        data:{
                            labels:expenseLabels,

                            datasets:[{
                                data:expenseData
                            }]
                        },

                        options:{
                            responsive:true,
                            maintainAspectRatio:false
                        }
                    }
                );

                // Wants vs Needs Pie Chart
                const wantsCtx = document.getElementById("wantsNeedsChart");
                if(wantsCtx){
                    const ctx = wantsCtx.getContext("2d");

                }

                wantsNeedsChart = new Chart(
                    wantsCtx,
                    {
                        type:"pie",
                        data:{
                            labels:[
                                "Wants",
                                "Needs"
                            ],

                            datasets:[{
                                data:[
                                    wants,
                                    needs
                                ]
                            }]
                        }
                    }
                );

                // Recurring vs One-Time            
                const recurringCtx = document.getElementById("recurringChart");

                if(recurringCtx){
                    const ctx = recurringCtx.getContext("2d");

                }

                recurringChart = new Chart(
                    recurringCtx,
                    {
                        type:"doughnut",
                        data:{
                            labels:[
                                "Recurring",
                                "One-Time"
                            ],

                            datasets:[{
                                data:[
                                    recurring,
                                    oneTime
                                ]
                            }]
                        }
                    }
                );
            }
        );
    }

    // Page Navigation
    function showDashboard(){
        document.getElementById("dashboardPage").style.display = "block";
        document.getElementById("expensePage").style.display = "none";
        document.getElementById("tablePage").style.display = "none";
        document.getElementById("dashboardNavButton").style.display = "none";
        document.getElementById("expenseNavButton").style.display = "inline-block";
        document.getElementById("tableNavButton").style.display = "inline-block";

    }

    function showExpensePage(){
        document.getElementById("dashboardPage").style.display = "none";
        document.getElementById("expensePage").style.display = "block";
        document.getElementById("tablePage").style.display = "none";
        document.getElementById("dashboardNavButton").style.display = "inline-block";
        document.getElementById("expenseNavButton").style.display = "none";
        document.getElementById("tableNavButton").style.display = "inline-block";

    }

    // Show Table Page
    function showTablePage(){
        document.getElementById("dashboardPage").style.display = "none";
        document.getElementById("expensePage").style.display = "none";
        document.getElementById("tablePage").style.display = "block";
        document.getElementById("dashboardNavButton").style.display = "inline-block";
        document.getElementById("expenseNavButton").style.display = "inline-block";
        document.getElementById("tableNavButton").style.display = "none";

    }

    // Editing Expenses
    function editExpense(expenseId){
        db.get(`SELECT Expenses.*, Types.typeName FROM Expenses
            LEFT JOIN Types
            ON Expenses.typeId=Types.typeid

            WHERE expenseid=?
            `,
            [expenseId],

            (err,row)=>{

                if(err){
                    console.error(err.message);
                    return;

                }

                if(!row){
                    return;

                }

                document.getElementById("editExpenseId").value = row.expenseid;
                document.getElementById("editExpenseName").value = row.name;
                document.getElementById("editExpenseDescription").value = row.description || "";
                document.getElementById("editExpenseType").value = row.typeName;
                document.getElementById("editExpenseDueDate").value = row.duedate || "";
                document.getElementById("editExpensePayDate").value = row.paydate || "";
                document.getElementById("editExpenseAmount").value = row.amount;
                document.getElementById("editModal").style.display = "flex";
            }
        );
    }

    // Closing Edit Modal
    function closeEditModal(){
        document.getElementById("editModal").style.display = "none";

    }

    // Save Edits
    function saveExpenseEdit(){
        const expenseId = document.getElementById("editExpenseId").value;
        const name = document.getElementById("editExpenseName").value.trim();
        const description = document.getElementById("editExpenseDescription").value.trim();
        const type = document.getElementById("editExpenseType").value;
        const dueDate = document.getElementById("editExpenseDueDate").value;
        const payDate = document.getElementById("editExpensePayDate").value;
        const amount = parseFloat(document.getElementById("editExpenseAmount").value);

        db.get(`SELECT typeid FROM Types
            WHERE typeName=?
            `,
            [type],

            (err,typeRow)=>{
                if(err){
                    console.error(err.message);
                    return;

                }

                db.run(`UPDATE Expenses
                    SET
                        name=?,
                        description=?,
                        typeId=?,
                        duedate=?,
                        paydate=?,
                        amount=?

                    WHERE expenseid=?`,
                    [
                        name,
                        description,
                        typeRow.typeid,
                        dueDate,
                        payDate,
                        amount,
                        expenseId
                    ],

                    function(err){
                        if(err){
                            console.error(err.message);
                            return;

                        }

                        closeEditModal();
                        loadExpenses();
                        loadCharts();

                    }
                );
            }
        );
    }

    // Page Navigation
    function showDashboard() {
        document.getElementById("dashboardPage").style.display = "block";
        document.getElementById("expensePage").style.display = "none";
        document.getElementById("tablePage").style.display = "none";

        document.getElementById("dashboardNavButton").style.display = "none";
        document.getElementById("expenseNavButton").style.display = "inline-block";
        document.getElementById("tableNavButton").style.display = "inline-block";
    }

    function showExpensePage() {
        document.getElementById("dashboardPage").style.display = "none";
        document.getElementById("expensePage").style.display = "block";
        document.getElementById("tablePage").style.display = "none";

        document.getElementById("dashboardNavButton").style.display = "inline-block";
        document.getElementById("expenseNavButton").style.display = "none";
        document.getElementById("tableNavButton").style.display = "inline-block";
    }

    function showTablePage() {
        document.getElementById("dashboardPage").style.display = "none";
        document.getElementById("expensePage").style.display = "none";
        document.getElementById("tablePage").style.display = "block";

        document.getElementById("dashboardNavButton").style.display = "inline-block";
        document.getElementById("expenseNavButton").style.display = "inline-block";
        document.getElementById("tableNavButton").style.display = "none";
    }

    // Window Functions
    window.editExpense = editExpense;
    window.closeEditModal = closeEditModal;
    window.saveExpenseEdit = saveExpenseEdit;
    window.showDashboard = showDashboard;
    window.showExpensePage = showExpensePage;
    window.showTablePage = showTablePage;

    // Logout
    function logout(){
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";

    }

        }catch(error){

            console.error(
                "INDEX ERROR:",
                error
            );

            alert(
                "INDEX CRASH: "+
                error.message
            );

        }

    }

);

// Window Functionality
window.logout = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";

};

window.showDashboard = () => {
    document.getElementById("dashboardTab").style.display = "block";
    document.getElementById("expenseTab").style.display = "none";
    document.getElementById("tableTab").style.display = "none";

};

window.showAddExpense = () => {
    document.getElementById("dashboardTab").style.display = "none";
    document.getElementById("expenseTab").style.display = "block";
    document.getElementById("tableTab").style.display = "none";

};

window.showTable = () => {
    document.getElementById("dashboardTab").style.display = "none";
    document.getElementById("expenseTab").style.display = "none";
    document.getElementById("tableTab").style.display = "block";

};

window.logout = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";

};