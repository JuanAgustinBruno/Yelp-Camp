
//require express to run the server
const express = require('express');
const app = express();

//set the template engine to use
app.set('view engine', 'ejs');

//sets the path to views folder
const path = require('path');
app.set('views', path.join(__dirname, 'views'))

//request to localhost:3000/

app.get('/', (req, res) => {
    res.render("home")
});


//set port listening

app.listen(3000, () => {
    console.log('Serving on port 3000')
})