<p align="left">
  <img src="https://private-equity-assets.s3.ap-southeast-2.amazonaws.com/logos/Group+1957+(1).png" alt="Junify Logo" width="200">
</p>

# Worker Check-in System

A Next.js application for managing worker check-ins via automated phone calls. The system uses AI to call workers, collect status updates, and provide summaries to supervisors.

## Features

- **Admin Dashboard**: Monitor worker status and call history
- **Worker Management**: Add, edit, and manage worker profiles
- **Automated Calls**: Schedule and initiate automated check-in calls
- **Email Summaries**: Send call summaries to supervisors via email
- **Dark-themed Admin UI**: Modern interface with dark sidebar and orange accent branding

## Tech Stack

- **Frontend**: Next.js with Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: (Add your auth solution here)
- **Styling**: Tailwind CSS v3
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL database
- SMTP server for email functionality

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/worker_checkin"
# Add other environment variables as needed
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

Open [http://localhost:3005](http://localhost:3005) with your browser to see the application.

## Project Structure

- `/src/pages` - Next.js pages
- `/src/components` - React components
- `/lib` - Shared utilities including database client
- `/prisma` - Database schema and migrations

## API Endpoints

- `/api/workers` - Worker management
- `/api/calls` - Call management
- `/api/calls/send-summary` - Email summary functionality

## Important Notes

- All API endpoints use the shared Prisma client from `lib/db.ts`
- The system allows initiating multiple calls for the same worker regardless of status
- Path aliases: `@/` points to the `src/` directory
