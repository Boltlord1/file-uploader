import { hash } from 'bcrypt'
import prisma from '../prisma.js'

try {
    console.log('Adding user...')
    const password = await hash('boltlord', 10)
    await prisma.user.deleteMany()
    await prisma.user.create({
        data: {
            name: 'boltlord',
            hash: password
        }
    })
    console.log('Added user.')
} catch (error) {
    console.log('Failed to add user.')
    console.error(error)
}