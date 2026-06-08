import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  let toast = new ToastrService;

  const token = localStorage.getItem("token");

  if(token){
    return true;
  }

  router.navigate(['/login']);

  toast.warning("Naa Munna Na Login Too Chahiye ","AAHA!!");
  

  return false;
};