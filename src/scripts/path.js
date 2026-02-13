import prisma from '../prisma.js'

try {
    console.log('Adding folders...')
    await prisma.folder.create({
        data: {
            name: 'folder',
            path: '/folder/',
            parent: {
                connect: {
                    path: '/'
                }
            }
        }
    })
    await prisma.folder.create({
        data: {
            name: 'folder',
            path: '/folder/folder/',
            parent: {
                connect: {
                    path: '/folder/'
                }
            }
        }
    })
    console.log('Added folders.')
} catch (error) {
    console.log('Failed to add folders.')
    console.error(error)
}