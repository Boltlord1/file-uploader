import { Router } from 'express'
import controllers from './controllers.js'
import passport from './utils/passport.js'
import upload from './utils/multer.js'

const router = Router()

router.get('/', (req, res) => res.status(200).render('index', { user: req.user }))
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

router.post('/file/upload', upload.single('new_file'), controllers.postUpload)
router.post('/file/upload/*path', upload.single('new_file'), controllers.postUpload)

router.get('/file/edit/:id', controllers.getFile)
router.post('/file/edit/:id', controllers.updateFile)
router.post('/file/delete/:id', controllers.deleteFile)

export default router