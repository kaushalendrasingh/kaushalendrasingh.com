import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './pages/Home'
import Admin from './pages/Admin'
import Contact from './pages/Contact'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/projects', element: <Projects /> },
  { path: '/projects/:projectId', element: <ProjectDetail /> },
  { path: '/contact', element: <Contact /> },
  { path: '/admin', element: <Admin /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
