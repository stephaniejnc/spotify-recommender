const express = require('express')
const router = express.Router()
router.use(express.json({limit: '1mb'})) // can limit JSON body size here

router.get('/', (req, res) => {
    console.log('Get request for home received')
    res.render('index', {layout: 'layouts/layout'})
})

router.get('/userhome', (req, res) => {
    console.log('Get request for userhome received')
    res.render('userhome', {layout: 'layouts/layout'})
})

router.get('/playlist', (req, res) => {
    console.log('Get request for playlist received')
    res.render('playlist', {layout: 'layouts/layout'})
})

router.get('/insights', (req, res) => {
    console.log('Get request for insights received')
    res.render('insights', {layout: 'layouts/layout'})
})

router.get('/loginPage', (req, res) => {
    console.log('Get request for login received')
    res.render('loginPage', {layout: 'layouts/no-layout'})
})

router.get('/searchuser', (req, res) => {
    console.log('Get request for search user received')
    res.render('searchuser', {layout: 'layouts/layout'})
})

module.exports = router