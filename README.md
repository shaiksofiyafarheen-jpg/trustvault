
# TrustVault – Secure Document Management System

TrustVault is a secure document management web application that helps users upload, store, view, download, and delete PDF documents through a simple and user-friendly interface.

## Live Demo

https://trustvault-sooty.vercel.app/

## Features

- User signup and login
- PDF document upload
- View and download documents
- Delete uploaded documents
- Private document storage using Supabase Storage
- Database access policies for user-specific documents
- Responsive and user-friendly interface

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase Authentication
- Supabase Database
- Supabase Storage
- Vercel

## How to Run Locally

### Prerequisites

Install Node.js and Git before running the project.

### 1. Clone the repository

```bash
git clone https://github.com/shaiksofiyafarheen-jpg/trustvault.git
```

### 2. Navigate to the application folder

```bash
cd trustvault
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the application directory and add your own Supabase project values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Replace the placeholder values with your actual Supabase URL and publishable key.

**Never commit `.env.local` or any Supabase secret or service-role key to GitHub.**

### 5. Start the development server

```bash
npm run dev
```

### 6. Open the application

Visit http://localhost:3000 in your browser.

## Security

- The document storage bucket is configured as private.
- Database and storage policies are intended to restrict access to each user's own documents.
- File type and file size validation are used in the upload flow.

Security settings should be tested before using the application with sensitive documents.

## Project Status

TrustVault is deployed as a live project. Authentication, document upload, viewing, downloading, and deletion should be tested on the deployed website before relying on these features.

## Developer

Developed as a document management project using Next.js and Supabase.
