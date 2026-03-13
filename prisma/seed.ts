import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await bcrypt.hash('123456', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@opscopilot.com' },
        update: {},
        create: {
            email: 'admin@opscopilot.com',
            name: 'Administrador',
            password: passwordHash,
        },
    })

    console.log({ admin })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
