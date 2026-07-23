# Poplog

Poplog is a full-stack web application that allows users to discover, track, and manage their favorite movies, TV shows, books, and games in one place.

I created Poplog because I consume a wide range of media and often lose track of my favorite content over time. This project was built as a way to organize and revisit everything in a single, personalized space.

## Live Demo

https://poplog.dev

### Demo Account

Want to explore Poplog without signing up? Use the demo account below:

Email: exampleuser@gmail.com

Password: EXAMpass1

Note: This is a shared public account intended for demo purposes. Data may change over time.

## Screenshots

<p align="center">
  <img src="./assets/home.png" width="40%" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./assets/search.png" width="40%" />
</p>

<br/>

<p align="center">
  <img src="./assets/journal.png" width="40%" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./assets/mediadetails.png" width="40%" />
</p>

## Features

- Search across multiple media types (movies, TV shows, books, and games)
- Browse trending content from external APIs
- JWT user authentication with protected routes
- Save media entries and manage them within a personal journal
- Sync external API data with a PostgreSQL database
- Fully responsive design for desktop and mobile devices
- Server-side caching to reduce external API requests and improve performance

## Tech Stack

### Frontend

- React
- React Router
- JavaScript
- CSS
- Vite

### Backend

- Node.js
- Express
- PostgreSQL

### Testing

- Vitest
- React Testing Library
- Supertest

### DevOps

- Docker
- Docker Compose
- GitHub Actions

### APIs

- TMDB API (movies & TV)
- IGDB API (games)
- Google Books API
- New York Times Books API

### Deployment & Infrastructure

- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL (hosted on Render)

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/nerdboy626/poplogApp.git
cd poplogApp
```

### 2. Install dependencies

Install the frontend and backend dependencies:

```bash
npm run install:all
```

### 3. Configure environment variables

Create the required environment files using the provided example files.

```
server/.env
poplog-app/.env
```

The backend also requires a running PostgreSQL database. Update the `DATABASE_URL` in `server/.env` to point to your local database.

### 4. Start the application

From the project root, run:

```bash
npm start
```

This starts both the Express backend and the React development server.

Once both are running, visit http://localhost:3000.

## Running with Docker

After cloning the repository, start the application with Docker Compose:

```bash
docker compose up --build
```

This launches the React frontend, Express backend, and a PostgreSQL database in separate containers. The backend automatically connects to the database using Docker's internal network.

Once the containers are running, visit http://localhost:3000.

## What I Learned

Before building Poplog, I had a basic understanding of creating frontend applications with JavaScript and React, but very little experience working with servers. Through this project, I gained hands-on experience across the entire stack, from implementing authentication and designing a database to integrating multiple external APIs and optimizing performance.

- Implementing authentication using JWT and protecting routes
- Integrating and managing multiple third-party APIs
- Designing and querying a PostgreSQL database
- Handling asynchronous data flow and API caching strategies
- Building an automated CI pipeline using GitHub Actions
- Containerizing a multi-service application with Docker and Docker Compose
- Deploying a full-stack application using Vercel and Render

## Challenges

Working with four different APIs introduced challenges around inconsistent data formats, which required transforming and normalizing responses before displaying them on the client. I also had to account for API rate limits, which led me to implement caching strategies to reduce redundant requests.

Another major challenge was handling authentication state. Since this was my first time building a full authentication flow, ensuring users stayed logged in and rendering the correct UI based on their state required careful coordination between the frontend and backend.

## Future Improvements

One feature I would love to implement is a recommendation system based on a user's journal entries—for example, suggesting books based on their favorite games, or vice versa.

I would also like to expand Poplog with social features, such as following other users, commenting, and sharing entries, to make the platform feel more interactive and driven by community.
