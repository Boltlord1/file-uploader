import { body, validationResult, matchedData } from 'express-validator'
import { hash } from 'bcrypt'
import prisma from './prisma.js'
import recursion from './library/recursion.js'

const username = body('username').trim().notEmpty().isLength({ max: 256 })
const password = body('password').trim().notEmpty().isLength({ max: 256 })

async function postSignUpLast(req, res) {
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
    postSignUpLast
]

async function getRoot(req, res) {
    const folder = await prisma.folder.findUnique({
        where: { path: '/' },
        include: { files: true, children: true }
    })
    res.render('files', { folder: folder })
}

async function getFolder(req, res) {
    const path = req.params.path
    const folder = await prisma.folder.findUnique({
        where: { path: `/${path.join('/')}/` },
        include: { files: true, children: true }
    })
    if (!folder) {
        res.redirect('/invalid')
        return
    }
    const allPaths = await prisma.folder.findMany({ select: { path: true } })
    const paths = allPaths.map(path => path.path).filter(path => !path.startsWith(folder.path))
    res.render('files', { folder: folder, paths: paths })
}

const folderName = body('name').trim().notEmpty().isLength({ max: 256 })

async function postFolderLast(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.redirect('/invalid')
        return
    }
    const { name } = matchedData(req)
    const params = req.params.path || []
    const parentPath = params.length === 0 ? '/' : `/${params.join('/')}/`
    const path = `${parentPath}${name}/`
    const folder = await prisma.folder.findUnique({ where: { path: path }} )
    if (folder !== null) {
        res.redirect('/invalid')
        return
    }
    await prisma.folder.create({ data: {
            name: name,
            path: path,
            parent: { connect: { path: parentPath } }
        }
    })
    const redirectPath = `/files${parentPath}${name}`
    res.redirect(redirectPath)
}

const postFolder = [
    folderName,
    postFolderLast
]

async function updateFolderLast(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.redirect('/invalid')
        return
    }
    const { name } = matchedData(req)
    const oldPath = `/${req.params.path.join('/')}/`
    const parentPath = req.body.parent
    const path = `${parentPath}${name}/`
    await prisma.folder.update({
        where: { path: oldPath },
        data: {
            name: name,
            path: path,
            parent: { connect: { path: parentPath } }
        }
    })
    await recursion.updateChildren(path)
    const redirectPath = `/files${parentPath}${name}`
    res.redirect(redirectPath)
}

const updateFolder = [
    folderName,
    updateFolderLast
]

async function deleteFolder(req, res) {
    const path = req.body.path
    if (path === '/') {
        res.redirect('/invalid')
        return
    }
    await recursion.deleteChildren(path)
    res.redirect('/files')
}

// async function getUpload(req, res) {
//     const params = req.params.path || []
//     const path = params.length === 0 ? '/' : `/${params.join('/')}/`
//     res.render('upload', { user: req.user, path: path })
// }

async function postUpload(req, res) {
    const params = req.params.path || []
    const path = params.length === 0 ? '/' : `/${params.join('/')}/`
    const file = req.file
    await prisma.file.create({ data: {
        name: file.originalname,
        mime: file.mimetype,
        url: file.filename,
        size: file.size,
        folder: { connect: { path: path } }
    }})
    const redirectPath = `/files${path.slice(0, -1)}`
    res.redirect(redirectPath)
}

export default {
    postSignUp,
    getRoot,
    getFolder,
    postFolder,
    updateFolder,
    deleteFolder,
    // getUpload,
    postUpload
}