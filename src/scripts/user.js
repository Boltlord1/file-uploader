import { hash } from 'bcrypt'
import prisma from '../prisma.js'

const password = await hash('boltlord', 10)

await prisma.user.deleteMany()
await prisma.user.create({
    data: {
        name: 'boltlord',
        hash: password
    }
})