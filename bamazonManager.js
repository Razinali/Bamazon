//Dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");

// Styling & Table
const chalk = require('chalk');
const log = console.log;
var Table = require('cli-table');

// Create the connection information for the bamazon sql database
//Database connection 
var server = require('./server.js');

var connection = mysql.createConnection(server);

// Connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);

    menuOptions();
});

//Function that presents displays the product and prompts for purchase
function displayProducts(res) {
    //Table formatting using Cli-table package
    // Creates table for the information from the mysql database 
    var table = new Table({
        head: ['ITEM ID', 'PRODUCT NAME', 'PRICE', 'Quantity'],
        style: {
            colWidths: [100, 400],
            head: ['blue'],
            compact: true,
            colAligns: ['center'],
            "padding-left": 2,
            "padding-right": 10
        }
    });
    for (var i = 0; i < res.length; i++) {
        table.push([res[i].item_id, res[i].product_name, "$" + res[i].price, res[i].stock_quantity]);
    }
    console.log(table.toString());
};


//Prompts Manager for menu options.
function menuOptions() {
    inquirer.prompt({
        name: "options",
        type: "list",
        message: "What would you like to view today?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]

    }).then((response) => {
        switch (response.options) {
            case "View Products for Sale":
                viewProductForSale();
                break;
            case "View Low Inventory":
                ViewLowInventory();
                break;
            case "Add to Inventory":
                addToInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            case "Exit":
                exit();
                // connection.end();
                break;
        }
    });
};

//Displays the list of current inventory.
function viewProductForSale() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        // console.log("\n", results, "\n");
        displayProducts(results);
        menuOptions();
    });
};

//Displays the list of the inventory that are less than 5 units.
function ViewLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 10", function (err, results) {
        if (err) throw err;
        // console.log("\n", results, "\n");
        displayProducts(results);
        menuOptions();
    });
};

//Adds inventory for existing products.
function addToInventory() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        displayProducts(results);

        inquirer.prompt([
            {
                name: "productId",
                type: "input",
                message: "Please enter the product ID you would like to update from the inventory:",
                validate: function (value) {
                    if (value !== "" && isNaN(Number(value)) == false && Number(value) > 0) {
                        return true;
                    } else {
                        return chalk.bgRed("ERROR - Invalid ID. Please enter a valid ID from the table");
                    }
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "Enter the quantity you want to add to inventory:",
                validate: function (value) {
                    if (value !== "" && isNaN(value) == false && value > 0) {
                        return true;
                    } else {
                        return chalk.bgRed("ERROR - Insufficient quantity. Please enter a valid Number.");
                    }
                }
            }
        ])
            .then(function (response) {
                var item;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].item_id === parseInt(response.productId)) {
                        item = results[i];
                    }
                }
                if (item === null) {
                    log(chalk.bgRed("ERROR - Invalid ID. Please enter a valid ID from the table"));
                    menuOptions();
                    return;
                }
                // Updates the inventory after adding additional products
                connection.query("UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: Number(item.stock_quantity) + Number(response.quantity)
                        },
                        {
                            item_id: item.item_id
                        }
                    ],
                    function (err) {
                        if (err) throw err;
                        log(chalk.blue.bold(`\n The ${item.product_name}, inventory was updated. \n`));
                        menuOptions();
                    });
            });
    });
};

//Displays the prompt for adding new products.
function addNewProduct(results) {

    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        displayProducts(results);

        inquirer
            .prompt([
                {
                    name: "productId",
                    type: "input",
                    message: "Enter the new product ID you would like to add to the inventory:",
                    validate: function (value) {
                        if (value !== "" && isNaN(value) == false && value > 0) {
                            return true;
                        } else {
                            return chalk.bgRed("ERROR - Invalid ID. Please enter a valid ID from the table");
                        }
                    }
                },
                {
                    name: "productName",
                    type: "input",
                    message: "Enter the new product name you would like to add to the inventory:"
                },
                {
                    name: "department",
                    type: "list",
                    message: "Which Department does this product belong to:",
                    choices: ["Apparel", "Books", "Electronics", "Gardening", "Housewares"]
                },
                {
                    name: "price",
                    type: "input",
                    message: "Enter the price for the new product:"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "Enter the quantity of the product:",
                    validate: function (value) {
                        if (value !== "" && isNaN(value) == false && value > 0) {
                            return true;
                        } else {
                            return chalk.bgRed("ERROR - Insufficient quantity. Please enter a valid Number.");
                        }
                    }
                },
            ])
            .then(function (response) {
                connection.query("INSERT INTO products SET ?",
                    {
                        item_id: response.productId,
                        product_name: response.productName,
                        department_name: response.department,
                        price: response.price,
                        stock_quantity: response.quantity
                    })
                log(chalk.blue.bold("\n The store inventory was updated. \n"));
                // displayProducts(results);
                menuOptions();

            }).catch(function (err) {
                if (err)
                    log(chalk.bgRed("**ERROR** Invalid ID, ID you provided already exits in the database"));

                connection.query("SELECT * FROM products", function (err, results) {
                    displayProducts(results);
                    menuOptions();
                })
            })
    })
};

// If the user chooses to coninue viewing or exit
function exit() {
    connection.query("SELECT * FROM products", function (err, results) {

        inquirer.prompt(
            [{
                type: "confirm",
                name: "quit",
                message: chalk.blue("Would you like to continue viewing Inventory?"),
            }]
        )
            .then(response => {
                if (response.quit) {
                    displayProducts(results);
                    menuOptions();
                } else {
                    log(chalk.blue.bold("\n======================================================================================="));
                    log(chalk.blue.bold("\n\t\t\t     Thank you for updating Bamazon "));
                    log(chalk.blue.bold("\n=======================================================================================\n "));
                    process.exit(0);
                }
            })
    })
};
