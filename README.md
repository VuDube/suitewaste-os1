# SuiteWaste OS
A desktop-style PWA for the waste management sector, featuring a multi-window OS interface and AI-powered workflow applications.
[cloudflarebutton]
SuiteWaste OS is an advanced, desktop-style Progressive Web App (PWA) designed for the South African waste management sector. It provides a comprehensive suite of tools within a familiar, intuitive desktop environment, running entirely in the browser. The OS shell features a window manager for running multiple applications simultaneously, a taskbar for quick app switching, a start menu for launching tools, virtual desktops for organizing workflows, and a notification center for real-time alerts. Integrated applications cover core industry needs: Operations (route planning, live tracking), Compliance (AI-driven checklists), Payments (cashless transactions), an e-Waste Marketplace, interactive Training modules, and real-time Dashboards. The entire experience is powered by an integrated AI Assistant, built on Cloudflare Agents, that provides contextual help, automates tasks, and offers data-driven insights, creating a 'self-driving' frontend experience.
## Key Features
-   **Complete Desktop Environment:** A familiar multi-window, draggable, and resizable interface that runs in the browser.
-   **Core OS Shell:** Includes a persistent Taskbar, a Start Menu for launching applications, and a Notification Center for real-time alerts.
-   **Integrated Application Suite:**
    -   **Operations:** Manage routes and track vehicles on an interactive map.
    -   **Compliance:** Stay up-to-date with AI-powered regulatory checklists.
    -   **Payments:** Handle secure, cashless transactions.
    -   **e-Waste Marketplace:** A platform for the circular economy.
    -   **Training Hub:** Access interactive and gamified learning modules.
    -   **Dashboards:** Visualize real-time KPI and ESG metrics.
-   **AI-Powered Assistant:** A "self-driving" frontend experience powered by Cloudflare Agents for contextual help and task automation.
-   **Built on Cloudflare:** Leverages Cloudflare Workers and Durable Objects for a robust, scalable, and serverless backend.
## Technology Stack
-   **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
-   **UI Components:** shadcn/ui, Framer Motion, Lucide React
-   **State Management:** Zustand
-   **Backend:** Cloudflare Workers, Hono
-   **Persistence:** Cloudflare Durable Objects
-   **AI:** Cloudflare Agents, Cloudflare AI Gateway
## Getting Started
Follow these instructions to get the project up and running on your local machine for development and testing purposes.
### Prerequisites
-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated.
### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/suitewaste-os.git
    cd suitewaste-os
    ```
2.  **Install dependencies:**
    ```bash
    bun install
    ```
3.  **Set up environment variables:**
    Create a `.dev.vars` file in the root of the project for local development. You can copy the example below.
    ```ini
    # .dev.vars
    # Cloudflare AI Gateway URL
    # Format: https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_NAME/openai
    CF_AI_BASE_URL="your-cloudflare-ai-gateway-url"
    # Cloudflare AI Gateway API Key
    CF_AI_API_KEY="your-cloudflare-api-key"
    # SerpAPI Key for Web Search Tool
    SERPAPI_KEY="your-serpapi-key"
    ```
    These variables are required for the AI chat and web search functionality to work.
## Development
To start the local development server, which includes the Vite frontend and the Wrangler server for the worker, run:
```bash
bun dev
```
This will start the frontend application (typically on `http://localhost:3000`) and the Cloudflare Worker backend. The Vite development server is configured to proxy all API requests (`/api/*`) to the local worker instance.
## PWA Installation & Offline Testing
1.  **Installation:** When running the application in a compatible browser (like Chrome), an install icon will appear in the address bar. Click it to install SuiteWaste OS as a standalone desktop application.
2.  **Offline Mode:** Once installed, the application's core assets are cached. To test offline functionality, open your browser's developer tools, go to the "Network" tab, and select the "Offline" preset. The application should still load and be usable.
## Backend Integration Guide
The frontend is ready for Phase 2 backend integration. The primary contract is defined in `AUDIT_REPORT.md` and implemented via TanStack Query hooks in `src/lib/api.ts`. The backend team should implement the API endpoints as specified to enable live data flow.
## Deployment
This project is designed for easy deployment to Cloudflare Pages.
1.  **Build the project:**
    ```bash
    bun build
    ```
2.  **Deploy to Cloudflare:**
    ```bash
    bun deploy
    ```
This command will build the frontend application and deploy both the static assets and the worker functions to your Cloudflare account.
**Note:** The project name has been updated to 'suitewaste' (lowercase) in `wrangler.jsonc` for compatibility. Run `bun build` and `bun deploy` to verify there are no configuration validation errors and that the UI deploys successfully. Check deployment logs for successful asset uploads and worker binding.
## Troubleshooting
-   **AI Assistant Not Responding:** Ensure your `CF_AI_BASE_URL` and `CF_AI_API_KEY` are correctly set in your `.dev.vars` file (for local development) or as secrets in your Cloudflare dashboard (for production). Note that there is a limit on the number of requests that can be made to the AI servers.
-   **Web Search Tool Fails:** The web search tool requires a `SERPAPI_KEY`. Make sure it is configured.
-   **Map Not Loading:** The Operations App map requires an internet connection to load tiles from OpenStreetMap.
-   **Deployment Fails:** If deployment fails after the name change, double-check that the `name` in `wrangler.jsonc` is lowercase and alphanumeric. Also, ensure your Cloudflare API token has the correct permissions.
## Contributing
Contributions are welcome! Please feel free to open an issue or submit a pull request.
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
---
*Built with ❤️ at Cloudflare*