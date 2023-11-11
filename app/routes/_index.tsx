import { json, LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getDBClient } from 'database/client';
import { trainees } from 'database/schema';

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const db = getDBClient(context)
  const result = await db.select().from(trainees).all()
  
  return json({
    trainees: result
  })
}

export const meta: MetaFunction = () => {
  return [
    { title: 'dot-strive' },
    { name: 'description', content: 'training' },
  ];
};

const Index = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <main>
      <h1>registered trainees</h1>
      <ul>
        {data.trainees.map((trainee) => (
          <li key={trainee.id}>{trainee.name}</li>
        ))}
      </ul>
    </main>
  );
};
export default Index;
