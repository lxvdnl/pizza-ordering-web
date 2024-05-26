const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { Pool } = require('pg');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'reviews',
	password: 'Alexseev1254',
	port: 5432
});

pool.connect((err, client, done) => {
  if (err) throw err;
  console.log('Connected to database');
  done();
});

app.get("/", function(req,res) {
	pool.query('SELECT * FROM reviews', (err, result) => {
		if (err) {
		  console.error(err);
		  res.sendStatus(500);
		  return;
		}
		res.render('index.html', {rows: result.rows});
	});
});

app.get("/pizzaInformation", function(req,res) {
    const pizzaName = req.query.pizza;
	const pizzaPrice = req.query.price;
	if (pizzaName === 'four cheeses')
		pizzaImgName = 'fourCheeses';
	else if (pizzaName === 'bbq chicken')
		pizzaImgName = 'bbqChicken';
	else
		pizzaImgName = pizzaName;
	
	let additionalIngredients, mainIngridients;
	if (pizzaName === 'pepperoni'){
		mainIngridients = "Ingredients: dough, tomato sauce, cheese, pepperoni, olive oil";
		additionalIngredients = "champignons 0.5$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.5><br>";
		additionalIngredients += "onions 0.4$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.4><br>";
		additionalIngredients += "tomatoes 0.3$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.3><br>";
	} else if (pizzaName === 'four cheeses') {
		mainIngridients = "Ingredients: dough, mozzarella, parmesan, gorgonzola, dor blue cheese";
		additionalIngredients = "champignons 0.5$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.5><br>";
		additionalIngredients += "onions 0.4$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.4><br>";
		additionalIngredients += "tomatoes 0.3$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.3><br>";
		additionalIngredients += "pepper 0.5$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.5><br>";
	} else if (pizzaName === 'margarita') {
		mainIngridients = "Ingredients: dough, tomatoes, mozzarella, basil, olive oil, salt";
		additionalIngredients = "champignons 0.5$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.5><br>";
		additionalIngredients += "onions 0.4$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.4><br>";
		additionalIngredients += "pepper 0.5$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.5><br>";
	} else if (pizzaName === 'hawaiian') {
		mainIngridients = "Ingredients: dough, tomato sauce, natural pineapples, ham, mozzarella";
		additionalIngredients = "oregano 0.4$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.4><br>";
		additionalIngredients += "olives 0.4$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.4><br>";
		additionalIngredients += "cherry tomatoes 0.3$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.3><br>";
		additionalIngredients += "green pepper 0.5$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.5><br>";
	} else if (pizzaName === 'bbq chicken') {
		mainIngridients = "Ingredients: dough, barbecue sauce, chicken, mozzarella cheese, red onion, red pepper, corn, parsley";
		additionalIngredients = "mushrooms 0.5$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.5><br>";
		additionalIngredients += "olives 0.4$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.4><br>";
		additionalIngredients += "ham 0.6$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.6><br>";
		additionalIngredients += "bacon 0.5$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.5><br>";
		additionalIngredients += "pineapples 0.4$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.4><br>";
	} else if (pizzaName === 'mexican') {
		mainIngridients = "Ingredients: tomatoes, red onions, olives, chili peppers, beans, corn, bell peppers, cheese, coriander, avocado, guacamole";
		additionalIngredients = "chicken 0.6$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.6><br>";
		additionalIngredients += "jalapeno pepper 0.5$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.5><br>";
		additionalIngredients += "sour cream 0.3$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.3><br>";
		additionalIngredients += "cinnamon 0.5$<input type=\"checkbox\" name=\"additionalIngredientsPrice\" value=0.5><br>";
	}
	
	res.render('pizzaInformation.html', {
		pizzaName : pizzaName,
		pizzaImgName : pizzaImgName,
		pizzaPrice: pizzaPrice,
		additionalIngredients: additionalIngredients,
		mainIngridients: mainIngridients
	});
});

app.post("/orderPage", function(req,res) {
    let additionalIngredientsPrice = req.body.additionalIngredientsPrice.reduce(function (x,y) { return (Number(x) + Number(y)).toFixed(1);}, 0);
	let pizzaPrice = req.body.pizzaPrice;
	let totalPrice = Number(additionalIngredientsPrice) + Number(pizzaPrice);
	res.render('orderPage.html', {
		additionalIngredientsPrice: additionalIngredientsPrice,
		pizzaPrice: pizzaPrice,
		totalPrice: totalPrice
	});
});

let fullName = "Unknown user";
let phoneNumber = "";

app.post("/review", function(req,res) {
    if(req.body.hasOwnProperty("fullName") && req.body.hasOwnProperty("phoneNumber")) {
		fullName = req.body.fullName;
		phoneNumber = req.body.phoneNumber;
		res.render('review.html');
	} else if (req.body.hasOwnProperty("review")) {
		let review = req.body.review;
		if (review) {
			pool.query("INSERT INTO reviews VALUES ($1, $2, $3)", [fullName, review, phoneNumber], (err, result) => {
				if (err) {
					console.error(err);
					res.sendStatus(500);
					return;
				} else {
					console.log('Data added successfully');
				}
			});
		}
		res.redirect('/');
	}
});

app.listen(3000);