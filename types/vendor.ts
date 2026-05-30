export type Vendor = {
  id: string
  name: string
  email: string
  phone: string
  category: string
  status: 'active' | 'inactive' | 'pending'
  created_at: string
}
