import { body, validationResult, matchedData } from 'express-validator'
import { hash } from 'bcrypt'
import prisma from './utils/prisma.js'
import recursion from './utils/recursion.js'
import cloudinary from './utils/cloudinary.js'

const varchar = (name) => body(name).trim().notEmpty().isLength({ max: 256 })
const mimetype = body('mime').trim().isMimeType()

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
    varchar('username'),
    varchar('password'),
    postSignUpLast
]

async function getRoot(req, res) {
    const folder = await prisma.folder.findUnique({
        where: { path: '/' },
        include: { files: true, children: true }
    })
    for (const file of folder.files) {
        file.link = cloudinary.url(file.url, { flags: 'attachment:image' })
    }
    res.render('files', { folder: folder, logged: req.isAuthenticated() })
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
    res.render('files', { folder: folder, paths: paths, logged: req.isAuthenticated() })
}

async function postFolderLast(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty() || !req.isAuthenticated()) {
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
    varchar('name'),
    postFolderLast
]

async function updateFolderLast(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty() || !req.isAuthenticated()) {
        res.redirect('/invalid')
        return
    }
    const { name } = matchedData(req)
    const oldPath = `/${req.params.path.join('/')}/`
    const parentPath = req.body.parent
    const path = `${parentPath}${name}/`
    const folder = await prisma.folder.findUnique({ where: { path: path }} )
    if (folder !== null) {
        res.redirect('/invalid')
        return
    }
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
    varchar('name'),
    updateFolderLast
]

async function deleteFolder(req, res) {
    const path = req.body.path
    if (!req.isAuthenticated() || path === '/') {
        res.redirect('/invalid')
        return
    }
    await recursion.deleteChildren(path)
    res.redirect('/files')
}

async function uploadToCloudinary(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/invalid')
        return
    }
    await cloudinary.uploader.upload(req.file.path, { folder: 'odin-file-uploader' }, (err, result) => {
        if (err) {
            console.error(err)
            res.redirect('/invalid')
            return
        }
        req.file.public_id = result.public_id
        next()
    })
}

async function postUploadLast(req, res) {
    const params = req.params.path || []
    const path = params.length === 0 ? '/' : `/${params.join('/')}/`
    const file = req.file
    const dupe = await prisma.file.findUnique({ where: { fullPath: {
        name: file.originalname,
        folderPath: path
    }}})
    if (dupe !== null) {
        res.redirect('/invalid')
        return
    }
    await prisma.file.create({ data: {
        name: file.originalname,
        mime: file.mimetype,
        url: file.public_id,
        size: file.size,
        folder: { connect: { path: path } }
    }})
    const redirectPath = `/files${path.slice(0, -1)}`
    res.redirect(redirectPath)
}

const postUpload = [
    uploadToCloudinary,
    postUploadLast
]

async function getFile(req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/invalid')
        return
    }
    const id = Number(req.params.id)
    const file = await prisma.file.findUnique({ where: { id: id }})
    if (!file) {
        res.redirect('/invalid')
        return
    }
    const allPaths = await prisma.folder.findMany({ select: { path: true } })
    const paths = allPaths.map(path => path.path)
    res.render('file', { file: file, paths: paths })
}

async function updateFileLast(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty() || !req.isAuthenticated()) {
        res.redirect('/invalid')
        return
    }
    const { name, mime } = matchedData(req)
    const folder = req.body.folder
    const id = Number(req.params.id)
    const file = await prisma.file.findUnique({ where: { fullPath: {
        name: name,
        folderPath: folder
    }}})
    if (file !== null) {
        res.redirect('/invalid')
        return
    }
    await prisma.file.update({
        where: { id: id },
        data: {
            name: name,
            mime: mime,
            folder: { connect: { path: folder }}
        }
    })
    const redirectPath = `/files${folder.slice(0, -1)}`
    res.redirect(redirectPath)
}

const updateFile = [
    varchar('name'),
    mimetype,
    updateFileLast
]

async function deleteFile(req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/invalid')
        return
    }
    const id = Number(req.params.id)
    await prisma.file.delete({ where: { id: id }})
    res.redirect('/files')
}

export default {
    postSignUp,
    getRoot,
    getFolder,
    postFolder,
    updateFolder,
    deleteFolder,
    postUpload,
    getFile,
    updateFile,
    deleteFile
}