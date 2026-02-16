import prisma from './prisma.js'
import { compare } from 'bcrypt'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'

async function strategy(username, password, done) {
    try {
        const member = await prisma.user.findUnique({ where: { name: username } })
        if (!member) return done(null, false, { message: 'Incorrect username.' })
        const match = await compare(password, member.hash)
        if (!match) return done(null, false, { message: 'Incorrect password.' })
        return done(null, member)
    } catch (err) {
        return done(err)
    }
}

passport.use(new LocalStrategy(strategy))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

async function deserialize(id, done) {
    try {
        const member = await prisma.user.findUnique({ where: { id: id } })
        done(null, member)
    } catch (err) {
        done(err)
    }
}

passport.deserializeUser(deserialize)

export default passport