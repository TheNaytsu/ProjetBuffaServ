var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');


router.post('/register', async (req, res) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    })
    const result = await user.save()
    const {password, ...data} = await result.toJSON()
    res.send(data)
})


router.post('/login', async (req, res) =>{

    const user = await User.findOne({ email: req.body.email })

        if (!user){
            return res.status(404).send("Cet utilisateur n'existe pas");
        }

        if(!await bcrypt.compare(req.body.password, user.password)){
            return res.status(400).send('Mot de passe incorrect');
        }

        const token = jwt.sign({ _id: user._id }, config.secret);

        res.cookie('jwt',token, {
            secure: false,
            httpOnly: false,
            maxAge: 24*60*60*1000
        })

        res.status(200).send({ auth: true, token: token });

});

router.get('/user',async(req,res)=>{
    try {
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, config.secret)
        if (!claims) {
            return res.status(401).send("Non autorisé")
        }
        const user = await User.findOne({_id: claims._id})
        const {password, ...data} = await user.toJSON()
        res.send(data)
    }catch(e){
        return res.status(401).send("Non autorisé")
    }
});


router.post('/logout', (req, res)=> {
    res.cookie('jwt','',{maxAge: 0})
    res.status(200).send({ auth: false, token: null });
});

module.exports = router;
