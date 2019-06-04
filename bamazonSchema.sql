-- Drops the "bamazonDB" if it exists currently
DROP DATABASE IF EXISTS bamazonDB;

-- Creates the "bamazonDB" database --
CREATE DATABASE bamazonDB;

-- Makes it so all of the following code will affect "bamazonDB" --
USE bamazonDB;

-- Creates the table"bamazonDB"
CREATE TABLE products(
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT(10) NOT NULL,
  PRIMARY KEY (item_id)
);