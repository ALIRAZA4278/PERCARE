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
  super_admin: 'bg-red-100 text-red-700 border-red-200',
  operations: 'bg-blue-100 text-blue-700 border-blue-200',
  commerce: 'bg-orange-100 text-orange-700 border-orange-200',
  vet_admin: 'bg-teal-100 text-teal-700 border-teal-200',
  moderator: 'bg-purple-100 text-purple-700 border-purple-200',
  support: 'bg-gray-100 text-gray-600 border-gray-200',
};

// Which admin_roles can access each page (by path key)
export const PAGE_PERMISSIONS = {
  '/admin':            ['super_admin', 'operations', 'commerce', 'vet_admin', 'moderator', 'support'],
  '/admin/approvals':  ['super_admin', 'operations', 'commerce', 'vet_admin'],
  '/admin/users':      ['super_admin', 'operations', 'moderator', 'support'],
  '/admin/vets':       ['super_admin', 'operations', 'vet_admin'],
  '/admin/clinics':    ['super_admin', 'operations', 'vet_admin'],
  '/admin/stores':     ['super_admin', 'commerce'],
  '/admin/shelters':   ['super_admin', 'operations'],
  '/admin/products':   ['super_admin', 'commerce'],
  '/admin/pets':       ['super_admin', 'operations'],
  '/admin/lost-found': ['super_admin', 'operations', 'moderator'],
  '/admin/orders':     ['super_admin', 'operations', 'commerce'],
  '/admin/reports':    ['super_admin', 'moderator'],
  '/admin/reviews':    ['super_admin', 'moderator'],
  '/admin/tickets':    ['super_admin', 'support', 'operations'],
  '/admin/audit':      ['super_admin', 'operations'],
  '/admin/settings':   ['super_admin'],
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
