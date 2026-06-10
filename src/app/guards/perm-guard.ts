import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PermissionService } from '../services/permission';

// ─── PERMISSION GUARD ───
// Route data mein module: 'Styles' dena hoga
// Guard automatically check karega: kya user ko is module ka read access hai?
// Nahi hai → /unauthorized page pe redirect
export const permGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const perm   = inject(PermissionService);
  const router = inject(Router);

  const moduleName = route.data['module'];  // route data se module name lo

  // Koi module define nahi → access allow karo
  if (!moduleName) return true;

  // Admin → sab kuch allow
  // Non-admin → check karo canRead
  if (perm.canRead(moduleName)) {
    return true;
  }

  // Permission nahi → unauthorized page pe bhejo
  router.navigate(['/unauthorized']);
  return false;
};
