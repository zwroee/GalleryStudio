# Contributing to Gallery Studio

Thank you for your interest in contributing to Gallery Studio! We welcome contributions from the community to help make this the best self-hosted photo gallery solution.

## Getting Started

### Prerequisites

-   **Node.js**: v18 or higher
-   **Docker**: For running the database and backend services
-   **Git**: For version control

### Local Development Setup

1.  **Fork and Clone**
    Fork the repository on GitHub and clone your fork locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/GalleryStudio.git
    cd GalleryStudio
    ```

2.  **Environment Setup**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```

3.  **Start Services (Docker)**
    Start the PostgreSQL database and backend service:
    ```bash
    docker compose up -d
    ```

4.  **Frontend Setup**
    Run the frontend locally for development:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

## Project Structure

-   **`frontend/`**: React application (Vite, TypeScript, Tailwind CSS, Zustand)
-   **`backend/`**: Node.js API (Fastify, TypeScript, Drizzle ORM)
-   **`docker-compose.yml`**: Service orchestration

## Development Guidelines

### Code Style

-   We use **TypeScript** for both frontend and backend. Please ensure strong typing where possible.
-   **Tailwind CSS** is used for styling. Avoid custom CSS files unless necessary.
-   Follow the existing directory structure and naming conventions.

### Making Changes

1.  Create a new branch for your feature or fix:
    ```bash
    git checkout -b feature/amazing-feature
    ```
2.  Make your changes.
3.  Test your changes (manual verification is currently the primary method).
4.  Commit your changes with descriptive messages.

### Pull Requests

1.  Push your branch to your fork.
2.  Open a Pull Request against the `main` branch of the original repository.
3.  Describe your changes clearly and link to any relevant issues.

## Roadmap & Todo

Looking for something to work on? Here are some areas where we need help:

-   [ ] **E-commerce Store**: Integrate **Stripe API** to allow selling digital downloads and prints directly from galleries.
-   [ ] **Cloudflare Integration**: Add configuration guides and headers for running behind Cloudflare (security, caching, DDOS protection).
-   [ ] **Testing**: Implement unit and integration tests for both frontend and backend.
-   [ ] **Mobile Experience**: Improve responsiveness and touch interactions on the client gallery view.
-   [ ] **Accessibility**: Audit and improve a11y across the application (ARIA labels, keyboard navigation).
-   [ ] **Localization**: Add support for multiple languages (i18n).
-   [ ] **Cloud Storage**: Add support for S3-compatible storage providers (AWS S3, MinIO, Backblaze B2, R2).
-   [ ] **Social Login**: Allow clients to access restricted galleries using Google/Facebook login.
-   [ ] **Watermarking Engine**: Improve the watermark system (dynamic positioning, tiling, opacity controls).
-   [ ] **Themes**: Implement a theming system for client galleries.
-   [ ] **Documentation**: Improve API documentation and setup guides.

## Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub. include as much detail as possible to help us reproduce and understand the problem.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
