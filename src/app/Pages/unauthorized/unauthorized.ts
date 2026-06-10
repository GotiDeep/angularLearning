import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div style="min-height:100vh; display:flex; align-items:center; justify-content:center;
                background:#0f172a; flex-direction:column; gap:16px; font-family:'DM Sans',sans-serif;">
      <span style="font-size:64px;">🚫</span>
      <h1 style="color:#f8fafc; font-size:28px; margin:0;">Access Denied</h1>
      <p style="color:#94a3b8; font-size:15px; margin:0;">You don't have permission to view this page.</p>
      <button (click)="goBack()"
        style="margin-top:12px; padding:10px 24px; background:#6c63ff; color:#fff;
               border:none; border-radius:8px; font-size:14px; cursor:pointer;">
        ← Go Back
      </button>
    </div>
  `
})
export class Unauthorized {
  constructor(private router: Router) {}
  goBack() { window.history.back(); }
}
