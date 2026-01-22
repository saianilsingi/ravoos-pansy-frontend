# Ravoos Pansy – Frontend

## Project Overview

Ravoos Pansy is a modern, responsive Single Page Application (SPA) that serves as the customer-facing frontend for a full-stack e-commerce platform. Built with React and Vite, this application provides a seamless shopping experience allowing users to browse products, manage a shopping cart, and securely complete purchases.

This project connects to a decoupled Django REST Framework backend to handle business logic, authentication, and data persistence. It is designed with performance, scalability, and clean architecture in mind, making it suitable for production-grade deployments.

### Live Application
https://ravoos-pansy.pages.dev/

### Backend Repository
https://github.com/saianil/ravoos_pansy_backend

## Tech Stack

**Core Framework & tools**
*   **React (v19)**: Component-based UI library.
*   **Vite**: Next-generation frontend tooling for fast builds and HMR.
*   **React Router (v7)**: Client-side routing for SPA navigation.

**Styling**
*   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
*   **PostCSS / Autoprefixer**: CSS transformation and browser compatibility.

**State Management & Data Fetching**
*   **React Context API**: Global state management for Authentication and Cart sessions.
*   **Axios**: Promise-based HTTP client for REST API interaction.
*   **React Hooks**: Functional component state and side-effect management.

**Code Quality**
*   **ESLint**: Static code analysis.
*   **Prettier**: Code formatting (configured via ESLint).

## Frontend Architecture

The codebase follows a modular and component-driven architecture to ensure maintainability and scalability.

```
src/
├── api/          # Axios instance and API service layer configuration
├── assets/       # Static assets (images, icons)
├── components/   # Reusable UI components (Buttons, Cards, Inputs)
├── context/      # Global state providers (AuthContext, CartContext)
├── pages/        # Full page views corresponding to routes (Login, Home, Cart)
├── App.jsx       # Main application component and Route definitions
└── main.jsx      # Application entry point
```

### Key Architectural Decisions

*   **API Abstraction**: Direct API calls are avoided in components. Instead, a configured `axios` instance (located in `src/api`) handles base URLs, request headers (auth tokens), and response interceptors for centralized error handling.
*   **Context-Based State**: Authentication state (user session, tokens) is managed globally via React Context to accessible throughout the application without prop drilling.

## Environment Configuration

This project relies on environment variables for API configuration.

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```

2.  Update the `.env` file with your backend API URL:

    ```env
    VITE_API_BASE_URL=http://localhost:8000/api
    ```

> **Note**: In production, ensure these variables are set in your hosting provider's dashboard.

## Authentication Flow

Authentication is handled via **Token-based authentication** provided by the Django REST Framework backend.

1. **Login / Signup**: User submits credentials to the backend.
2. **Token Storage**: On success, the backend returns a permanent auth token, which is stored in the browser (e.g., `localStorage`).
3. **Authenticated Requests**: An Axios request interceptor automatically attaches the  
   `Authorization: Token <token>` header to protected API requests.
4. **Session Persistence**: On application initialization, the presence of a stored token is checked to restore the user session without requiring re-login.

## Local Development Setup

Follow these steps to run the application locally.

### Prerequisites
*   Node.js (v18+ recommended)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd ravoos-pansy-frontend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Ensure your `.env` file is set up as described in the **Environment Configuration** section.

4.  **Start the Development Server**
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173`.

## Production Deployment

The project is optimized for deployment on static hosting platforms like **Vercel**, **Cloudflare Pages**, or **Netlify**.

### Build Command
To generate a production-ready build:

```bash
npm run build
```

This compiles the application into the `dist/` directory, which can be served as static assets.

### Deploying to Vercel (Example)
1.  Connect your GitHub repository to Vercel.
2.  Vite settings should be auto-detected:
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
3.  Add your `VITE_API_BASE_URL` in the Vercel Environment Variables settings.
4.  Deploy.

## Backend Connection

This frontend is designed to consume a RESTful API. Ensure your backend supports Cross-Origin Resource Sharing (CORS) for your frontend's domain (or `localhost` during development).

*   **Base URL**: Configured via `VITE_API_BASE_URL`.
*   **Endpoints**: The application expects standard REST endpoints for products, cart management, and authentication.

## Error Handling & UX

*   **Loading States**: UI components display skeleton loaders or spinners while fetching data to provide immediate feedback.
*   **Error Boundaries**: Graceful error handling for failed API requests (e.g., network errors, validation failures) with user-friendly toast notifications or alert messages.
*   **Route Protection**: Protected routes redirect unauthenticated users to the Login page seamlessly.

## Future Improvements

*   **Type Safety**: Migration to TypeScript for better compile-time error checking.
*   **Testing**: Implementation of Unit Tests (Vitest) and End-to-End tests (Cypress/Playwright).
*   **Performance**: Implementation of code-splitting and lazy loading for routes to improve initial load time.
*   **UI/UX**: Enhanced accessibility (a11y) adherence and dark mode support.
