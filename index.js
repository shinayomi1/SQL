const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');

// Create database connection
const db = new sqlite3.Database(':memory:');

//Create tables
db.serialize(() => {
    db.run(`CREATE TABLE departments (
        id INTEGER PRIMARY KEY,
        name TEXT
    )`);

    db.run(`CREATE TABLE roles (
        id INTEGER PRIMARY KEY,
        title TEXT,
        salary REAL,
        department_id INTEGER,
        FOREIGN KEY (department_id) REFERENCES departments(id)
    )`);

    db.run(`CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        role_id INTEGER,
        manager_id INTEGER,
        FOREIGN KEY (role_id) REFERENCES roles(id),
        FOREIGN KEY (manager_id) REFERENCES employees(id)
    )`);
});

// Function to prompt user for input
function prompt(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question(question, ans => {
        rl.close();
        resolve(ans);
    }));
}

// Function to view all departments
function viewDepartments() {
    db.all(`SELECT * FROM departments`, (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log("Departments:");
        rows.forEach(row => {
            console.log(`${row.id} | ${row.name}`);
        });
        main()

    });
}

// Function to view all roles
function viewRoles() {
    db.all(`SELECT roles.id, title, salary, departments.name as department FROM roles
            INNER JOIN departments ON roles.department_id = departments.id`, (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log("Roles:");
        rows.forEach(row => {
            console.log(`${row.id} | ${row.title} | ${row.salary} | ${row.department}`);
        });
        main()
    });
}

// Function to view all employees
function viewEmployees() {
    db.all(`SELECT employees.id, first_name, last_name, title, departments.name as department, salary, manager_id FROM employees
            INNER JOIN roles ON employees.role_id = roles.id
            INNER JOIN departments ON roles.department_id = departments.id`, (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log("Employees:");
        rows.forEach(row => {
            console.log(`${row.id} | ${row.first_name} ${row.last_name} | ${row.title} | ${row.department} | ${row.salary} | Manager: ${row.manager_id}`);
        });
        main()
    });
}

// Function to add a department
async function addDepartment() {
    const name = await prompt("Enter the name of the department: ");
    db.run(`INSERT INTO departments (name) VALUES (?)`, [name], err => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log("Department added successfully");
        main()
    });
}

// Function to add a role
async function addRole() {
    const title = await prompt("Enter the title of the role: ");
    const salary = await prompt("Enter the salary for the role: ");
    const departmentId = await prompt("Enter the department id for the role: ");
    db.run(`INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`, [title, salary, departmentId], err => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log("Role added successfully");
        main ()
    });
}

// Function to add an employee
async function addEmployee() {
    const firstName = await prompt("Enter the first name of the employee: ");
    const lastName = await prompt("Enter the last name of the employee: ");
    const roleId = await prompt("Enter the role id for the employee: ");
    const managerId = await prompt("Enter the manager id for the employee: ");
    db.run(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [firstName, lastName, roleId, managerId], err => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log("Employee added successfully");
        main()
    });
}

// Function to update an employee role
async function updateEmployeeRole() {
    const employeeId = await prompt("Enter the id of the employee to update: ");
    const newRoleId = await prompt("Enter the new role id for the employee: ");
    db.run(`UPDATE employees SET role_id = ? WHERE id = ?`, [newRoleId, employeeId], err => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log("Employee role updated successfully");
        main ()
    });
}

// Main function
async function main() {
    
        console.log("\nOptions:");
        console.log("1. View all departments");
        console.log("2. View all roles");
        console.log("3. View all employees");
        console.log("4. Add a department");
        console.log("5. Add a role");
        console.log("6. Add an employee");
        console.log("7. Update an employee role");
        console.log("8. Quit");

        const choice = await prompt("Enter your choice: ");

        switch (choice) {
            case "1":
                viewDepartments();
                break;
            case "2":
                viewRoles();
                break;
            case "3":
                viewEmployees();
                break;
            case "4":
                await addDepartment();
                break;
            case "5":
                await addRole();
                break;
            case "6":
                await addEmployee();
                break;
            case "7":
                await updateEmployeeRole();
                break;
            case "8":
                console.log("Exiting...");
                process.exit();
            default:
                console.log("Invalid choice. Please try again.");
        }
    }


main();
