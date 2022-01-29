const express = require("express");
const cors = require("cors");
const assignment = require('./app/routes/assignments');
const app = express();

app.use(cors())

app.use(express.json());


app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");


db.mongoose
    .connect('mongodb+srv://Yann:123@cluster0.bpzjc.mongodb.net/assignments?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Connexion avec MongoDb validé");
    })
    .catch(err => {
        console.error("Erreur de connexion", err);
        process.exit();
    });


require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
app.route('/api/assignments')
    .get(assignment.getAssignments)
    .post(assignment.postAssignment)
    .put(assignment.updateAssignment);

app.route('/api/assignments/:id')
    .get(assignment.getAssignment)
    .delete(assignment.deleteAssignment);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Le serveur est lancé sur le port ${PORT}.`);
});

