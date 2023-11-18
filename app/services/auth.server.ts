import { createId } from '@paralleldrive/cuid2';
import { createCookie, createWorkersKVSessionStorage } from '@remix-run/cloudflare';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from 'remix-auth-google';
import { object, string } from 'valibot';

import { trainees } from 'database/schema';

import type { AppLoadContext } from '@remix-run/cloudflare';
import type { Input } from 'valibot';

let authenticator: Authenticator<AuthUser> | undefined;

type GetAuthenticator = (context: AppLoadContext) => Authenticator<AuthUser>;
export const getAuthenticator: GetAuthenticator = (context) => {
  if (authenticator !== undefined) {
    return authenticator;
  }

  const env = context['env'] as Env;

  const cookie = createCookie('__session',{
    secrets: [env.SESSION_SECRET],
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
  });
  const sessionStorage = createWorkersKVSessionStorage({
    kv: env.SESSION_KV,
    cookie,
  });

  authenticator = new Authenticator<AuthUser>(sessionStorage);

  const googleStrategy = new GoogleStrategy<AuthUser>(
    {
      clientID: env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: env.GOOGLE_AUTH_CALLBACK_URL,
    },
    async (user) => {
      const database = drizzle(env.DB);

      const [trainee] = await database
        .select()
        .from(trainees)
        .where(eq(trainees.authUserId, user.profile.id));

      if (trainee !== undefined) {
        return {
          id: trainee.id,
          name: trainee.name,
          image: trainee.image,
        };
      }

      const newTrainee = await database
        .insert(trainees)
        .values({
          id: createId(),
          name: user.profile.displayName,
          image: user.profile.photos[0].value,
          authUserId: user.profile.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .get();

      return {
        id: newTrainee.id,
        name: newTrainee.name,
        image: newTrainee.image,
      };
    },
  );
  authenticator.use(googleStrategy);

  return authenticator;
};

const authUserSchema = object({
  id: string(),
  name: string(),
  image: string(),
});
type AuthUser = Input<typeof authUserSchema>;
