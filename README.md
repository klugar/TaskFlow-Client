# TaskFlow Client

React + TypeScript frontend for the TaskFlow project management application.

## ⚙️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios with JWT interceptors

## ✨ Features

- 🔐 Login & registration pages
- 📁 Project dashboard with create/delete
- ✅ Task management with status & priority tracking
- 🔒 Protected routes with auth guards
- 🎨 Clean, responsive UI with Tailwind CSS

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- TaskFlow API running locally ([backend repo](https://github.com/klugar/TaskFlow))

### Setup

```bash
git clone https://github.com/klugar/TaskFlow-Client.git
cd TaskFlow-Client
npm install
npm run dev
```

Open `http://localhost:5173`

### Configuration

Update the API base URL in `src/api/axios.ts` if your backend runs on a different port:

```typescript
const api = axios.create({
  baseURL: 'https://localhost:7062/api',
});
```

## 📂 Project Structure