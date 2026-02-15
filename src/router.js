import { Router } from 'express'
import controllers from './controllers.js'
import passport from './passport.js'
import multer from 'multer'

const upload = multer({ dest: './uploads/'})
const router = Router()

router.get('/', (req, res) => res.render('index', { user: req.user }))
router.get('/invalid', (req, res) => res.render('invalid'))
router.get('/signup', (req, res) => res.render('signup'))
router.get('/login', (req, res) => res.render('login'))

router.post('/signup', controllers.postSignUp)
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/invalid'
}))

router.get('/files', controllers.getRoot)
router.get('/files/*path', controllers.getFolder)

router.post('/folder/create', controllers.postFolder)
router.post('/folder/create/*path', controllers.postFolder)
router.post('/folder/update/*path', controllers.updateFolder)
router.post('/folder/delete/', controllers.deleteFolder)

// router.get('/upload', controllers.getUpload)
// router.get('/upload/*path', controllers.getUpload)
router.post('/file/upload', upload.single('new_file'), controllers.postUpload)
router.post('/file/upload/*path', upload.single('new_file'), controllers.postUpload)

export default router