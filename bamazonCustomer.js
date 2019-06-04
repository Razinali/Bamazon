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

  // Run the welcome function after the connection is made to prompt the user
  welcome();
});


//Function that presents welcome statement 
function welcome() {
  log(chalk.blue.bold("\n======================================================================================="));
  log(chalk.blue.bold("\n\t\t\t     WELCOME TO BAMAZON "));
  log(chalk.blue.bold("\n========================================================================================\n"));

  displayProducts();
};

//Function that presents displays the product and prompts for purchase
function displayProducts() {
  var query = "SELECT item_id, product_name, price, stock_quantity FROM products";
  connection.query(query, function (err, res) {
    if (err) throw err;

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
    promptsCustomer();
  })
}
// };

// connection.pause();
function promptsCustomer() {
  inquirer
    .prompt([
      {
        name: "selection",
        type: "list",
        message: "\n Would you like to make a [PURCHASE] or [Exit] \n",
        choices: ["PURCHASE", "Exit"]
      },
    ])
    .then(function (response) {
      if (response.selection === "PURCHASE") {
        purchaseProducts();
        // console.log(table.toString());
        connection.resume();

      } else if (response.selection === "Exit") {
        log(chalk.red.bold("\n\t\t     Goodbye \n"));
        connection.end();
        return;

      } else {
        connection.end();
      }
    })
};

// Function that prompts user to purchase 
function purchaseProducts() {
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "choice",
          type: "input",
          message: chalk.blue("\n Please enter the Item ID of the product you would like to purchase?"),
          validate: function (value) {
            if (isNaN(Number(value)) === false && Number(value) < 12 && Number(value) !== 0) {
              return true;
            }
            return chalk.bgRed("\n ERROR - Invalid ID. Please enter a valid ID from the table");
          }
        },
        {
          name: "productQty",
          type: "input",
          message: chalk.blue("\n Enter the product quantity that you would like to purchase?"),
          validate: function (value) {
            if (isNaN(Number(value)) === false && Number(value) !== 0) {
              // if (value !== "" && isNaN(value) == false && value > 0) {

              return true;
            }
            return chalk.bgRed("ERROR - Insufficient quantity. Please enter a valid Number.");

          }
        }
      ])
      .then(function (response) {
        // Gets the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].item_id === parseInt(response.choice)) {
            chosenItem = results[i];
          }
        }

        // Determine if there is sufficient product
        if (parseInt(chosenItem.stock_quantity) > parseInt(response.productQty)) {
          var cost = response.productQty * chosenItem.price;

          log(chalk.blue.bold("\n"));
          log(chalk.green.bold(`Congratulations! You Purchased ${response.productQty} ${chosenItem.product_name} for $${cost}`));
          log(chalk.blue.bold("\n"));


          // Updates the database
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: chosenItem.stock_quantity - parseInt(response.productQty)
              },

              {
                item_id: response.choice
              }
            ],
            function (err) {
              if (err) throw err;
            }
          );
        }
        else {
          log(chalk.bgRed("ERROR - Insufficient quantity. Please enter a valid Number."));
          displayProducts();
        }
        coninueShopping();
      });
  });
};

// If the user chooses to coninue shopping oe exit
function coninueShopping() {
  inquirer.prompt(
    [{
      type: "confirm",
      name: "shop",
      message: chalk.blue("Would you like to continue shopping?"),
    }]
  )
    .then(response => {
      if (response.shop) {
        displayProducts();
      } else {
        log(chalk.blue.bold("\n======================================================================================="));
        log(chalk.blue.bold("\n\t\t\t     Thank you for Shopping With BAMAZON "));
        log(chalk.blue.bold("\n=======================================================================================\n "));
        process.exit(0);
      }
    });
};
