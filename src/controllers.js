import { body, validationResult, matchedData } from 'express-validator'
import { hash } from 'bcrypt'
import prisma from './prisma.js'

const username = body('username').trim().notEmpty().isLength({ max: 256 })
const password = body('password').trim().notEmpty().isLength({ max: 256 })

async function signUp(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.redirect('/invalid')
        return
    }
    const { username, password } = matchedData(req)
    const passwordHash = await hash (password, 10)
    await prisma.user.create({ data: { name: username, hash: passwordHash } })
    res.redirect('/')
}

const postSignUp = [
    username,
    password,
    signUp
]

async function postUpload(req, res) {
    console.log(req.file)
    const file = req.file
    await prisma.file.create({ data: {
        name: file.originalname,
        
    }})
    res.redirect('/')
}

export default {
    postSignUp,
    postUpload
}