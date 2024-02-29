import dayjs from 'dayjs'
import { Elysia, t } from 'elysia'

import { db } from '../../db/connection'
import { auth } from '../auth'

export const authenticateFromLink = new Elysia().use(auth).get(
  '/auth-links/authenticate',
  async ({ query, jwt: { sign } }) => {
    const { code, redirect } = query

    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code)
      },
    })

    if (!authLinkFromCode) {
      throw new Error('Auth link not found.')
    }

    const daysSinceAuthLinkWasCreated = dayjs().diff(
      authLinkFromCode.createdAt,
      'days',
    )

    if (daysSinceAuthLinkWasCreated > 7) {
      throw new Error('Auth link expired, please generate a new one.')
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerId, authLinkFromCode.userId)
      },
    })

    if (!managedRestaurant) {
      throw new Error('No restaurant found for this user.')
    }

    const jwt = await sign({
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurant.id,
    })
  },
  {
    query: t.Object({
      code: t.String(),
      redirect: t.String(),
    }),
  },
)
