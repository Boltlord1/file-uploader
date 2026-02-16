import prisma from './prisma.js'

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
        if (child.children.length > 0) await updateChildren(newPath)
    }
}

async function deleteChildren(path) {
    console.log(path)
    const transactions = [
        prisma.folder.delete({ where: { path: path }}),
        prisma.file.deleteMany({ where: { folderPath: path }})
    ]
    async function recursion(path) {
        const children = await prisma.folder.findMany({
            where: { parentPath: path },
            include: { children: true }
        })
        for (const child of children) {
            transactions.push(prisma.folder.delete({ where: { path: child.path }}))
            transactions.push(prisma.file.deleteMany({ where: { folderPath: child.path }}))
            if (child.children.length > 0) await recursion(child.path)
        }
    }
    await recursion(path)
    await prisma.$transaction(transactions)
}

export default {
    updateChildren,
    deleteChildren
}