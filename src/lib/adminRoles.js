export const ADMIN_ROLES = ['super_admin', 'operations', 'commerce', 'vet_admin', 'moderator', 'support'];

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  operations: 'Operations Admin',
  commerce: 'Commerce Admin',
  vet_admin: 'Vet Admin',
  moderator: 'Moderator',
  support: 'Support Agent',
};

export const ROLE_COLORS = {
  super_admin: 'bg-red-900 text-red-300 border-red-800',
  operations: 'bg-blue-900 text-blue-300 border-blue-800',
  commerce: 'bg-orange-900 text-orange-300 border-orange-800',
  vet_admin: 'bg-teal-900 text-teal-300 border-teal-800',
  moderator: 'bg-purple-900 text-purple-300 border-purple-800',
  support: 'bg-gray-800 text-gray-300 border-gray-700',
};

// Which admin_roles can access each page (by path key)
export const PAGE_PERMISSIONS = {
  '/admin':            ['super_admin', 'operations', 'commerce', 'vet_admin', 'moderator', 'support'],
  '/admin/approvals':  ['super_admin', 'operations', 'commerce', 'vet_admin'],
  '/admin/users':      ['super_admin', 'operations', 'moderator', 'support'],
  '/admin/vets':       ['super_admin', 'operations', 'vet_admin'],
  '/admin/stores':     ['super_admin', 'commerce'],
  '/admin/shelters':   ['super_admin', 'operations'],
  '/admin/products':   ['super_admin', 'commerce'],
  '/admin/pets':       ['super_admin', 'operations'],
  '/admin/orders':     ['super_admin', 'operations', 'commerce'],
  '/admin/reports':    ['super_admin', 'moderator'],
  '/admin/reviews':    ['super_admin', 'moderator'],
  '/admin/tickets':    ['super_admin', 'support', 'operations'],
  '/admin/audit':      ['super_admin', 'operations'],
};

// Returns true if this admin_role can access the given pathname
export function canAccess(adminRole, pathname) {
  if (!adminRole) return false;
  if (adminRole === 'super_admin') return true;
  // Match the most specific path first
  const match = Object.keys(PAGE_PERMISSIONS)
    .filter(p => pathname === p || pathname.startsWith(p + '/'))
    .sort((a, b) => b.length - a.length)[0];
  if (!match) return false;
  return PAGE_PERMISSIONS[match].includes(adminRole);
}

// Returns allowed nav items for a given admin_role
export function allowedNav(adminRole, allNav) {
  if (!adminRole) return [];
  if (adminRole === 'super_admin') return allNav;
  return allNav.filter(item => canAccess(adminRole, item.href));
}

export const ROLE_DESCRIPTIONS = {
  super_admin: 'Full access to everything',
  operations: 'Users, Vets, Shelters, Orders, Tickets, Audit',
  commerce: 'Stores, Products, Orders, Approvals',
  vet_admin: 'Vets & Vet Approvals only',
  moderator: 'Reviews, Reports, Users (view)',
  support: 'Tickets & Users (view)',
};
