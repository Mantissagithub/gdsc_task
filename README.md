# News Application Backend

This project serves as the backend system for a News client application. It provides functionalities for managing stories, comments, user profiles, authentication, and more.

## Features

- User authentication (sign up, sign in) using JWT tokens.
- CRUD operations for user profiles.
- CRUD operations for news stories.
- Commenting on news stories.
- Liking news stories.
- Bookmarking favorite news stories.
- Fetching top, new, and best stories.
- Fetching user submissions, comments, and karma points.

## Technologies Used

- **Express.js**: Used as the web application framework for Node.js.
- **JWT (JSON Web Tokens)**: Used for user authentication and authorization.
- **MongoDB**: NoSQL database used for storing user data, news stories, and comments.
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB and Node.js.
- **Shortid**: Library for generating unique short IDs.
- **Sanitize-html**: Used for sanitizing HTML inputs to prevent XSS attacks.
- **Cors**: Middleware for enabling Cross-Origin Resource Sharing.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Mantissagithub/gdsc_task.git
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
node index.js
```

## API Endpoints

- **User Authentication**:
- `POST /user/signup`: Sign up a new user.
- `POST /user/signin`: Sign in an existing user.

- **User Profile**:
- `GET /users/:user_id`: Get user profile by ID.
- `GET /user/:user_id/creationDate`: Get creation date of a user.
- `GET /user/:user_id/submissions`: Get submissions made by a user.
- `GET /user/:user_id/comments`: Get comments made by a user.
- `GET /user/:user_id/karma_points`: Get karma points of a user.

- **News Stories**:
- `POST /user/submission`: Submit a new news story.
- `GET /news`: Get all published news stories.
- `GET /news/:news_id/comments`: Get comments of a specific news story.
- `GET /news/top`: Get top news stories.
- `GET /news/new`: Get new news stories.
- `GET /news/best`: Get best news stories.

- **Comments**:
- `POST /user/:news_id/comments`: Add a comment to a news story.

- **Likes**:
- `POST /user/:news_id/like`: Like a news story.

- **Bookmarks**:
- `POST /user/bookmark/news/:news_id`: Bookmark a news story.
- `GET /user/bookmarks`: Get all bookmarked news stories for the current user.





