// Create the connection information for the bamazon sql database
var server = ({ 
host: "localhost",

// Your port; if not 3306
port: 3306,

// Your username
user: "root",

// Your password
password: "root",
database: "bamazonDB"
});

module.exports = server;