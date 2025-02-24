
# Survey Analysis Web Application

A full-stack web application that uses AI to analyze and simulate survey responses on political topics. The application generates detailed demographic personas and simulates their responses to survey questions.


https://github.com/user-attachments/assets/91e2a46e-b3de-4baa-9be7-287fe79d9194





## Features

- AI-powered survey response generation
- Demographic persona creation
- Real-time analysis visualization
- Interactive results display
- RESTful API backend

## Tech Stack

- Frontend: React with TypeScript
- Backend: Express.js
- Database: PostgreSQL with Drizzle ORM
- Styling: Tailwind CSS with Shadcn/UI
- AI Integration: OpenAI API

## Getting Started

1. Clone the project in Replit
2. Install dependencies:
```bash
npm install
```
3. Set up your environment variables in the Secrets tab:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `DATABASE_URL`: Your PostgreSQL database URL

4. Run the development server:
```bash
npm run dev
```

The application will be available on port 5000.

## Project Structure

- `/client`: React frontend application
- `/server`: Express.js backend
- `/shared`: Shared TypeScript types and schemas
- `/public`: Static assets

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run check`: Type-check TypeScript
- `npm run db:push`: Update database schema

## Deployment

Deploy directly on Replit:
1. Click the "Deploy" button
2. Choose "Autoscale" deployment
3. Configure build and run commands
4. Deploy your application

## License

MIT
