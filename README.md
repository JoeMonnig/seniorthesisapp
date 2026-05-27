# Senior Thesis Repo: Personal Finance Visualization and Management Tool
## Software Requirements Specification for the Personal Finance and Visualization Tool

## Introduction

### Purpose
The purpose of this application is to assist users in visualizing their finances. Especially with many tools today spamming users with ads and forcing them to input highly sensitive data into a 3rd party software that is vulnerable to data breaches. This helps with that as the application is locally host on the users machine so no one but the user themselves can access the data.

The key goals of the new system are:
- To improve the tracking of the users financial decisions.
- To provide users with visuals and tabling for ease-of-access visibility.
- To reduce the stress of having to give 3rd-party companies highly sensitive data.

### Scope
This system is intended to support the tracking and data entry processes of the user to assist in effectively visualizing their financial information. The system will handle:
- User authentication/registration and secure access to financial data records.
- Expense tracking and data entry.
- User validation and authentication through localized hashing.
- Management of data entries.
- Visualiztion through monthly and or yearly filteration.

### Definitions, Acronyms, and Abbreviations
- **Groceries**: Used to describe all food purchases.
- **Insurance**: Details all insurance expenses that might be used (Renter, Home, Car, Motorcycle, Pet, etc...).
- **Rent**: When a person enters a lease, the rent is what a user is charged monthly.
- **Utilities**: This details all things used within a home or rental like electricity, water, sewer, gas, etc...
- **Car Fuel**: For when a car needs to be filled with gas.
- **Income**: Total income for salary or hourly paid out wages.
- **Subscriptions**: What you are subscribed for that is being charged to your account (tv services, streaming services, social media, etc...).
- **Internet**: How much is being paid monthly/yearly for an internet services.

## Overview:
The Personal Finance Visualization and Management Tool (PFVMT) is a data based tool that utilizes data that the user inputs to assist in the visualization of finances in which the user may incur. This is created to allow users to have an easier way to look at ways to save money or be at ease for accidental overspending. 

### System Features:
1. **Secure Login**: Ensures that only authorized users with registered accounts have access to the system, with user authentication based on personal credentials.
2. **Data Visualization**: Allows the user to see the data they enter instead of looking at just a graph and edit it if they so please.
3. **Graphed Data**: Visualizes the data inputted into the table to make the reablity of the financial data significantly easier.
4. **Pie Charting**: Easier to visualize expenses as a whole rather than a bar or a line graph.
5. **Annual Graphing**: Allows to visually see where the yearly expenses are being mostly spent or if there are cutbacks to make for one-time wants or recurring wants in the future.

The system is designed with scalability in mind, allowing it to handle hundreds of data entries per month or thousands yearly. It will integrate with a self contained database locally hosted on the user's machine updating when the user inputs new data rather than once the application closes.

The following sections detail the specific use cases that the system will support, describing how students and staff will interact with the system during typical operations.

## Use Cases

### Use Case 1.0: User Registration
- **New User**: Application user/username.
- **Overview**: Users enter username and password to successfully register a new account.

**Typical Course of Events**:
1. Page prompts for username and password.
2. User enters their username and password and clicks the register button.
3. System verifies that user registration was successfull with a prompt.

**Alternative Courses**:
- **Step 3**: Username is already in use.
  1. Displays error.
  2. Go back to step 1 and select a different username.

### Use Case 1.1: Secure Login
- **Users**: Application user/username.
- **Overview**: Users enter username and password to securely log in.

**Typical Course of Events**:
1. Page prompts for username and password.
2. User enters their username and password and clicks the login button.
3. System verifies that the username and password are correct.

**Alternative Courses**:
- **Step 3**: User and/or password are not correct.
  1. Displays error.
  2. Go back to step 1.

### Use Case 1.2: Viewing Graphs
- **Users**: Application account user.
- **Overview**: User successfully logs in to the application and finds the charting. If charts are blank refer to Use Case 1.3 (*Adding Expenses*)

**Typical Course of Events**:
1. Run Use Case 1.1, *Secure Login*.
2. Displays graphs
3. User can higlights parts of the charts to see expense amounts in each partition.

**Alternative Courses**:
- When viewing a new accounts graphs
  1. All graphs will be blank since there is no data in the tables.
  2. Refer to Use Case 1.3 (*Adding Expenses*) before utilizing the full capabilities of Use Case 1.2 (*Viewing Graphs*)

### Use Case 1.3: Adding Expenses
- **Users**: Application acount user.
- **Overview**: User adds a new expense to the database.

**Typical Course of Events**:
1. While viewing Use Case 1.2 (*Viewing Charts*).
2. Users click the "Add Expense" button located in the navigation bar on the top of the application.
3. The add expense tab opens allowing the users to input new data.
4. User enters in information regarding the specific expense they want to add. Requiring at minimum filling out the expense name and an amount.
5. User then clicks the "Add Expense" button at the bottom of the form.
6. User is prompted with "Expense Added".
7. User is then redirected to the Expense Table.

**Alternative Courses**:
- **Step 5**: Not all required information has been added.
  1. Displays "Please enter an expense name." or "Please enter an amount.".
  2. Run Use Case 1.3 (*Adding Expenses*) and refer to **Step 4**.

### Use Case 1.4: Checking the Expense Table
- **Users**: Application Account User
- **Overview**: User checks expense table

**Typical Course of Events**:
1. Run Use Case 1.2 (*Viewing Charts*).
2. User clicks "Expenses Table" button.
3. User can view the table and all expenses names, types, amounts and due dates.
4. User can filter by months and years to specifically view data from specific selected months and/or years

**Alternative Courses**:
- **Step 3**: Blank Table
  1. Table appears blank and has no data.
  2. Refer to Use Case 1.3 (*Adding Expenses*)
- **Step 4**: Filtering
  1. Filtering stays static throughout all tabs until changed in expenses table
  2. Restart or change filtering back too all to view all data and then refer to Use Case 1.2 (*Viewing Charts*)
