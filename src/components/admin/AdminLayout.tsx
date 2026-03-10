import { Outlet } from 'react-router-dom'
import { AdminGuard } from './AdminGuard'
import { AdminSidebar } from './AdminSidebar'

export function AdminLayout() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="ml-60 min-h-screen">
          <Outlet />
        </main>
      </div>
    </AdminGuard>
  )
}