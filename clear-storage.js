// Clear localStorage data to force API usage
if (typeof window !== 'undefined') {
  localStorage.removeItem('inventory_users')
  localStorage.removeItem('inventory_tools')
  localStorage.removeItem('inventory_loans')
  localStorage.removeItem('inventory_categories')
  localStorage.removeItem('inventory_current_user')
  console.log('LocalStorage cleared')
}
