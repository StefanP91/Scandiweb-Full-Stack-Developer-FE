import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'

// Main Pages
import Root from './Root.jsx'
import All from './pages/All.jsx'
import Category from './pages/Category.jsx'

// Subpages
import ProductDetail from './pages/ProductDetail.jsx'

// Error Page
import ErrorPage from './pages/ErrorPage.jsx'

import './index.css'


const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <All />,
      },

      {
        path: '/category/:category',
        element: <Category />,
      },

      {
        path: 'product/:productId',
        element: <ProductDetail />
      }

    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
