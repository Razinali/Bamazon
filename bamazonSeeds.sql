-- Creates new rows containing data in all named columns --
INSERT INTO products(product_name, department_name, price, stock_quantity) 

VALUES
    ("T Shirts", "Apparel", "9.99", "100"),
    ("Black Dress","Apparel", "99.69", "26"),
    ("Harry Potter", "Books", "11.99", "35"),
    ("Book of Coding","Books", "9.99", "5"),
    ("I Pad","Electronics", "300.00", "100"),
    ("Apple Watch","Electronics", "799.99", "7"),
    ("Maple Tree","Gardening", "75.00", "15"),
    ("Bird Feeder","Gardening", "15.59", "20"),
    ("Toaster Oven","Housewares", "109.50", "11"),
    ("Table Cloth","Housewares", "13.00", "7"),
    ("Coffee Maker","Housewares", "99.99", "50");

SELECT * FROM bamazondb.products;