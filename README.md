# Cortex Plan: Your Minimalist Exam Planner

[cloudflarebutton]

A minimalist, visually-driven exam planner to help students organize subjects, exams, and study schedules with effortless elegance.

## About The Project

Cortex Plan is a visually stunning, minimalist web application designed to help students organize their exam preparation with clarity and focus. It provides a clean, intuitive interface for managing subjects, scheduling exams, and planning study sessions.

The core philosophy is 'less is more,' removing clutter to create a calm and productive planning environment. The application features a central dashboard for an at-a-glance overview of upcoming deadlines, a dedicated exam management section, a subject organizer with color-coding, and a beautiful calendar view for visualizing the study schedule. Every interaction is designed to be smooth, responsive, and aesthetically pleasing, making exam preparation a less stressful and more organized process.

## Key Features

*   **Dashboard:** A central hub providing a summary of upcoming exams, today's study schedule, and overall progress.
*   **Exam Management:** Full CRUD functionality to add, view, edit, and delete exams with key details like subject, date, and time.
*   **Subject Organization:** Manage academic subjects and assign a unique color to each for better visual organization across the application.
*   **Calendar View:** A full-page calendar to visualize all exam dates and scheduled study sessions.

## Built With

This project leverages a modern, type-safe stack for performance and developer experience.

*   **Frontend:**
    *   [React](https://reactjs.org/)
    *   [Vite](https://vitejs.dev/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [shadcn/ui](https://ui.shadcn.com/)
    *   [Zustand](https://zustand-demo.pmnd.rs/) for state management
    *   [Framer Motion](https://www.framer.com/motion/) for animations
*   **Backend:**
    *   [Cloudflare Workers](https://workers.cloudflare.com/)
    *   [Hono](https://hono.dev/)
    *   [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/) for stateful storage

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   [Bun](https://bun.sh/) installed on your machine.
*   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/cortex-plan.git
    cd cortex-plan
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Run the development server:**
    The development server starts both the Vite frontend and the Hono backend on Cloudflare Workers concurrently.
    ```sh
    bun dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Project Structure

The project is organized into three main directories:

*   `src/`: Contains the frontend React application, including pages, components, hooks, and styles.
*   `worker/`: Contains the backend Hono application that runs on Cloudflare Workers, including API routes and entity definitions for Durable Objects.
*   `shared/`: Contains TypeScript types and interfaces that are shared between the frontend and backend to ensure type safety.

## Development Guide

### Backend (Cloudflare Worker)

*   **API Routes:** Add or modify API endpoints in `worker/user-routes.ts`. The Hono router is configured to handle requests to `/api/*`.
*   **Data Entities:** Define new data structures and their storage logic in `worker/entities.ts`. Each entity extends the `IndexedEntity` class, which abstracts away the interaction with the global Durable Object.
*   **Shared Types:** Always define data types in `shared/types.ts` to maintain consistency between the client and server.

### Frontend (React)

*   **Pages:** New views or pages should be created in the `src/pages/` directory and added to the router in `src/main.tsx`.
*   **Components:** Reusable UI components are located in `src/components/`. We heavily utilize `shadcn/ui` components, which can be found in `src/components/ui/`.
*   **API Client:** A simple API client is provided in `src/lib/api-client.ts` for making requests to the backend.
*   **State Management:** Global state is managed with Zustand. Create new stores as needed to handle application state.

## Deployment

This application is designed for seamless deployment to Cloudflare's global network.

1.  **Build the application:**
    This command bundles the frontend and backend for production.
    ```sh
    bun build
    ```

2.  **Deploy to Cloudflare:**
    This command publishes your application to your Cloudflare account.
    ```sh
    bun deploy
    ```

Alternatively, you can deploy directly from your GitHub repository with a single click.

[cloudflarebutton]

## License

Distributed under the MIT License. See `LICENSE` for more information.