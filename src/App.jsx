import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Sidebar from './components/common_components/Sidebar'
import LoginPage from './pages/LoginPage'
import OverviewPage from './pages/OverviewPage'
import ProductsPage from './pages/ProductsPage'
import UsersPage from './pages/UsersPage'
import CampsitePage from './pages/CampsitePage'
import OrdersPage from './pages/OrdersPage'
import SettingsPage from './pages/SettingsPage'
import CategoryPage from './pages/CategoryPage'

const App = () => {
  const { user } = useAuth()
  const isAuthenticated = !!user
  // const isAuthenticated = true
  return (
    <div className='flex h-screen bg-gray-900 text-gray-100'>
      {isAuthenticated && <Sidebar />}

      <div className='flex-1'>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            } 
          />
          
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <OverviewPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          <Route
            path="/products"
            element={
              isAuthenticated ? (
                <ProductsPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          <Route
            path="/users"
            element={
              isAuthenticated ? (
                <UsersPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          <Route
            path="/campsites"
            element={
              isAuthenticated ? (
                <CampsitePage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          <Route
            path="/categories"
            element={
              isAuthenticated ? (
                <CategoryPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/orders"
            element={
              isAuthenticated ? (
                <OrdersPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          <Route
            path="/settings"
            element={
              isAuthenticated ? (
                <SettingsPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
          />
        </Routes>
      </div>
    </div>
  )
}

export default App