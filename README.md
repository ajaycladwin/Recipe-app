# Recipe App

A beginner-friendly Recipe Application built with React and Vite. It allows users to browse recipes by letter, category, search for specific meals, filter by ingredients, and save their favorite recipes.

## Features

- **Search Recipes:** Quickly search for your favorite meals by name.
- **Browse by Categories:** Filter meals by categories like Beef, Chicken, Seafood, Vegan, etc.
- **Browse by Letter:** Find meals that start with a specific letter.
- **Ingredient Filter:** Find recipes containing specific ingredients.
- **Random Meal:** Don't know what to cook? Use the 'Surprise Me' button to get a random recipe.
- **Favorites:** Save and manage your favorite recipes locally.
- **Recipe Details:** View detailed ingredients, measurements, step-by-step instructions, and even a YouTube tutorial (when available).

## Tech Stack

- **Frontend:** React (Vite)
- **Styling:** Tailwind CSS v4 (Simplified beginner-friendly layout)
- **Routing:** React Router
- **API:** TheMealDB API

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ajaycladwin/Recipe-app.git
   ```
2. Navigate into the frontend folder:
   ```bash
   cd "Recipe App/frontend"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment (Netlify)

This project is configured to be deployed easily on Netlify. It includes a `netlify.toml` file at the root to handle build settings and Single Page Application (SPA) routing.

### Steps to Deploy:
1. Log in to your [Netlify](https://www.netlify.com/) account.
2. Click on **Add new site** > **Import an existing project**.
3. Select **GitHub** and authorize Netlify.
4. Search for and select the `Recipe-app` repository.
5. The build settings should automatically be populated from the `netlify.toml` file:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
6. Click **Deploy site**.
7. Wait a few moments for the build to finish. Once done, Netlify will provide you with a live URL to your deployed app!

## License

This project is open-source and available under the MIT License.
