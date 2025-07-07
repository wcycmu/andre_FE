# Andre FE - Your Best Smart Wall Street BFF

This is a modern, responsive frontend for the Andre MVP API. It allows users to upload transaction history, view their portfolio, get market data and news, and receive AI-powered analysis.

## Features

- **Transaction Upload**: Upload your brokerage transaction history via CSV.
- **Dashboard**: View a preview of your portfolio.
- **Market Insights**: Get real-time stock data and the latest news.
- **Sentiment Analysis**: Log your market sentiment.
- **Portfolio Analysis**: Receive personalized recommendations based on your data.

## Tech Stack

- **Framework**: React (with TypeScript)
- **Styling**: Tailwind CSS
- **API Communication**: Fetch API

---

## Local Development

To run this application on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later is recommended)
- A running instance of the Andre FastAPI backend on `http://localhost:8000`.

### Running the Application

This project is self-contained and uses the Tailwind CSS CDN, so it doesn't require a complex build process. You can run it with any simple local HTTP server.

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:wcycmu/andre_FE.git
    cd andre_FE
    ```

2.  **Serve the project directory:**
    If you have Node.js, you can use the `serve` package.
    
    ```bash
    # Install serve globally if you don't have it already
    npm install -g serve
    
    # Run the server from the project's root directory
    serve .
    ```
    The application will be available at a local URL shown in your terminal (usually `http://localhost:3000`).

---

## Deployment to GitHub Pages

This repository is configured to automatically deploy to GitHub Pages when you push to the `main` branch.

### How It Works

The deployment process is handled by a GitHub Actions workflow defined in `.github/workflows/deploy.yml`. Here's a summary of the steps:

1.  **Trigger**: The workflow runs automatically on every `push` to the `main` branch.
2.  **Build**: It sets up a GitHub Pages environment and prepares the project files as a deployment artifact.
3.  **Deploy**: It deploys the artifact to your GitHub Pages service.
4.  **Publish**: GitHub serves the content at your GitHub Pages URL.

### Setting Up GitHub Pages for Your Fork

If this is your first time deploying from this repository, you need to enable GitHub Pages:

1.  Navigate to your repository on GitHub: `https://github.com/wcycmu/andre_FE`
2.  Go to **Settings** > **Pages**.
3.  Under "Build and deployment", for the **Source**, select **GitHub Actions**.
4.  That's it! GitHub is now configured to accept deployments from your Actions workflow.

Your site will be deployed at `https://wcycmu.github.io/andre_FE/`.

**Note:** It might take a few minutes for the site to become live after the first deployment workflow completes successfully. You can monitor the progress in the "Actions" tab of your repository.
