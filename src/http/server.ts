import { Elysia } from 'elysia'
import { z } from 'zod'

import { db } from '../db/connection'
import { restaurants, users } from '../db/schema'

const app = new Elysia().post('/restaurants', async ({ body, set }) => {
  const createRestaurantBodySchema = z.object({
    restaurantName: z.string(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  })

  const { restaurantName, name, email, phone } =
    createRestaurantBodySchema.parse(body)

  const [manager] = await db
    .insert(users)
    .values({
      name,
      email,
      phone,
      role: 'manager',
    })
    .returning({
      id: users.id,
    })

  await db.insert(restaurants).values({
    name: restaurantName,
    managerId: manager.id,
  })

  set.status = 204
})

app.listen(3333, () => {
  console.log('HTTP server running!')
})
