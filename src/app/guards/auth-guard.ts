import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = () => {

  const router  = inject(Router);
  const toastr  = inject(ToastrService); // ← inject() use karo, 'new' nahi

  const token = localStorage.getItem("token");

  if (token) {
    return true;
  }

  toastr.warning("Please login first!", "Access Denied");
  router.navigate(['/login']);
  return false;
};