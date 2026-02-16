import prisma from '../utils/prisma.js'

try {
    console.log('Deleting files...')
    await prisma.file.deleteMany()
    console.log('Deleted files.')
} catch (error) {
    console.log('Failed to delete files.')
    console.error(error)
}