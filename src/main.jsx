import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'

// Main Pages
import Root from './Root.jsx'
import All from './pages/All.jsx'
import Clothes from './pages/Clothes.jsx'
import Tech from './pages/Tech.jsx'

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
        path: '/all',
        element: <All />,
      },

      {
        path: '/clothes',
        element: <Clothes />
      },

      {
        path: '/tech',
        element: <Tech />
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
