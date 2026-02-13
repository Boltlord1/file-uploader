import prisma from '../prisma.js'

try {
    console.log('Adding folder...')
    const deleteFiles = prisma.file.deleteMany()
    const deleteFolders = prisma.folder.deleteMany()
    await prisma.$transaction([deleteFiles, deleteFolders])
    await prisma.folder.create({
        data: {
            name: 'root',
            path: '/'
        }
    })
    console.log('Added folder.')
} catch (error) {
    console.log('Failed to add folder.')
    console.error(error)
}