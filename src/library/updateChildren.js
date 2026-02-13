import prisma from '../prisma.js'

async function updateChildren(path) {
    const children = await prisma.folder.findMany({
        where: { parentPath: path },
        include: { children: true }
    })
    for (const child of children) {
        const newPath = child.parentPath + child.name + '/'
        await prisma.folder.update({
            where: { path: child.path },
            data: { path: newPath }
        })
        if (child.children) updateChildren(newPath)
    }
}

export default updateChildren