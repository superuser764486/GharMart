'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ArrowLeft, Lock, Unlock, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { verifyAdminAccess } from '@/lib/admin-auth'
import { getAllUsers, blockUser, unblockUser, deleteUser, getUserStatistics } from '@/lib/admin/users'
import { DataTable } from '@/components/admin/DataTable'
import { supabase } from '@/lib/supabase'

export default function UsersManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked' | 'inactive'>('all')
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminId, setAdminId] = useState('')

  useEffect(() => {
    checkAdminAndLoadUsers()
  }, [searchQuery, roleFilter, statusFilter])

  const checkAdminAndLoadUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const isAdminUser = await verifyAdminAccess(user.id)
      if (!isAdminUser) {
        router.push('/')
        return
      }

      setAdminId(user.id)
      setIsAdmin(true)
      loadUsers()
      loadStats()
    } catch (error) {
      console.error('[v0] Admin check failed:', error)
      router.push('/')
    }
  }

  const loadUsers = async () => {
    try {
      const result = await getAllUsers({
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
        limit: 50,
      })
      setUsers(result.users)
    } catch (error) {
      console.error('[v0] Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const userStats = await getUserStatistics()
      setStats(userStats)
    } catch (error) {
      console.error('[v0] Failed to load stats:', error)
    }
  }

  const handleBlockUser = async (userId: string) => {
    if (!confirm('Are you sure you want to block this user?')) return

    if (await blockUser(adminId, userId, 'Admin action')) {
      loadUsers()
      loadStats()
    }
  }

  const handleUnblockUser = async (userId: string) => {
    if (!confirm('Are you sure you want to unblock this user?')) return

    if (await unblockUser(adminId, userId)) {
      loadUsers()
      loadStats()
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('This will soft-delete the user. Are you sure?')) return

    if (await deleteUser(adminId, userId, 'Admin action')) {
      loadUsers()
      loadStats()
    }
  }

  if (!isAdmin) return null

  const columns = [
    {
      key: 'email' as const,
      label: 'Email',
      sortable: true,
    },
    {
      key: 'phone' as const,
      label: 'Phone',
    },
    {
      key: 'full_name' as const,
      label: 'Name',
      sortable: true,
    },
    {
      key: 'role' as const,
      label: 'Role',
      render: (value: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'admin' ? 'bg-purple-100 text-purple-800' :
          value === 'vendor' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'is_blocked' as const,
      label: 'Status',
      render: (value: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {value ? 'Blocked' : 'Active'}
        </span>
      ),
    },
    {
      key: 'created_at' as const,
      label: 'Joined',
      render: (value: any) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (value: string, item: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/users/${value}`)}
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {item.is_blocked ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUnblockUser(value)}
              title="Unblock user"
              className="text-green-600 hover:text-green-700"
            >
              <Unlock className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBlockUser(value)}
              title="Block user"
              className="text-red-600 hover:text-red-700"
            >
              <Lock className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteUser(value)}
            title="Delete user"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'blue' },
              { label: 'Active Users', value: stats.activeUsers, color: 'green' },
              { label: 'Blocked Users', value: stats.blockedUsers, color: 'red' },
              { label: 'New This Month', value: stats.newUsersThisMonth, color: 'purple' },
            ].map((stat, idx) => (
              <div key={idx} className={`bg-gray-800 border border-gray-700 rounded-lg p-4`}>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search by email, phone, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setRoleFilter('all')
                  setStatusFilter('all')
                }}
                variant="outline"
                className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading users...</div>
          ) : users.length > 0 ? (
            <DataTable
              columns={columns}
              data={users}
              rowKey="id"
              striped
            />
          ) : (
            <div className="p-8 text-center text-gray-400">No users found</div>
          )}
        </div>
      </main>
    </div>
  )
}
