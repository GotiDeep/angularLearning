import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// ════════════════════════════════════════════════════════════════
// PERMISSION SERVICE
// Ye service do kaam karti hai:
// 1. localStorage mein stored permissions ko read karti hai
// 2. Backend se permission APIs call karti hai
// ════════════════════════════════════════════════════════════════
@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  api = "http://localhost:3000/api";

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────
  // AUTH HEADER BANANA
  // Har protected API call ke saath JWT token bhejna hoga
  // Backend ka verifyToken middleware is token ko check karega
  // ─────────────────────────────────────────────────
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // ─────────────────────────────────────────────────
  // PERMISSION CHECK FUNCTIONS
  // localStorage mein stored permissions se check karo
  // ─────────────────────────────────────────────────

  // Sabhi permissions ek baar mein lo (parse karke)
  private getAllPermissions(): any[] {
    const stored = localStorage.getItem('permissions');
    return stored ? JSON.parse(stored) : [];
  }

  // Ek specific module ki permission object lo
  private getModulePermission(moduleName: string): any {
    const permissions = this.getAllPermissions();
    // find → array mein se wo item jo module_name match karta ho
    return permissions.find(
      (p: any) => p.module_name?.toLowerCase() === moduleName.toLowerCase()
    );
  }

  // Admin hai? → is_super_role localStorage mein stored hai
  isAdmin(): boolean {
    const user = localStorage.getItem('user');
    if (!user) return false;
    const parsed = JSON.parse(user);
    return parsed.is_super_role === true;
  }

  // ─────────────────────────────────────────────────
  // LOGOUT
  // localStorage se teeno cheezein clear karo:
  // token, user, permissions → sab hatao
  // Router ka kaam component ka hai (yahan sirf clear karo)
  // ─────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
  }

  // ─── Module Level Permission Checks ───

  // Read: Page open kar sakta hai?
  canRead(moduleName: string): boolean {
    if (this.isAdmin()) return true; // Admin sab kar sakta hai
    const perm = this.getModulePermission(moduleName);
    return perm?.can_read === 1 || perm?.can_read === true;
  }

  // Write: Add/Edit kar sakta hai?
  canWrite(moduleName: string): boolean {
    if (this.isAdmin()) return true;
    const perm = this.getModulePermission(moduleName);
    return perm?.can_write === 1 || perm?.can_write === true;
  }

  // Delete: Delete kar sakta hai?
  canDelete(moduleName: string): boolean {
    if (this.isAdmin()) return true;
    const perm = this.getModulePermission(moduleName);
    return perm?.can_delete === 1 || perm?.can_delete === true;
  }

  // Export: Excel/PDF export kar sakta hai?
  canExport(moduleName: string): boolean {
    if (this.isAdmin()) return true;
    const perm = this.getModulePermission(moduleName);
    return perm?.can_export === 1 || perm?.can_export === true;
  }

  // Import: Import kar sakta hai?
  canImport(moduleName: string): boolean {
    if (this.isAdmin()) return true;
    const perm = this.getModulePermission(moduleName);
    return perm?.can_import === 1 || perm?.can_import === true;
  }

  canView(moduleName: string): boolean {
    if (this.isAdmin()) return true;
    const perm = this.getModulePermission(moduleName);
    return perm?.can_read === 1 || perm?.can_read === true;
  }

  // ─────────────────────────────────────────────────
  // PERMISSION MANAGEMENT APIs (Admin/Manager ke liye)
  // ─────────────────────────────────────────────────

  // Sabhi users lo (permission assign karne ke liye)
  getUsers() {
    return this.http.get(`${this.api}/permissions/users`, {
      headers: this.getHeaders()
    });
  }

  // Sabhi modules lo
  getModules() {
    return this.http.get(`${this.api}/permissions/modules`, {
      headers: this.getHeaders()
    });
  }

  // Ek user ki permissions lo
  getUserPermissions(userId: number) {
    return this.http.get(`${this.api}/permissions/user/${userId}`, {
      headers: this.getHeaders()
    });
  }

  // Permissions save karo
  savePermissions(userId: number, permissions: any[]) {
    return this.http.post(`${this.api}/permissions/save`,
      { userId, permissions },
      { headers: this.getHeaders() }
    );
  }
}
