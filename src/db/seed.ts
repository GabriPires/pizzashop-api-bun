/* eslint-disable drizzle/enforce-delete-with-where */

import { faker } from '@faker-js/faker'
import chalk from 'chalk'

import { db } from './connection'
import { restaurants, users } from './schema'

// delete all data from the database
await db.delete(restaurants)
await db.delete(users)

console.log(chalk.yellow('✔ Database reset!'))

// create customer
await db.insert(users).values([
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'customer',
  },
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'customer',
  },
])

console.log(chalk.yellow('✔ Customers created!'))

// create manager
const [manager] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: 'admin@admin.com',
      role: 'manager',
    },
  ])
  .returning({
    id: users.id,
  })

console.log(chalk.yellow('✔ Manager created!'))

// create restaurant
await db.insert(restaurants).values([
  {
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    managerId: manager.id,
  },
])

console.log(chalk.yellow('✔ Restaurant created!'))

console.log(chalk.greenBright('✔ Database seeded successfully!'))

process.exit()
