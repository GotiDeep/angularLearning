import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PermissionService {

  api = "http://localhost:3000/api";

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  private getAllPermissions(): any[] {
    const stored = localStorage.getItem('permissions');
    return stored ? JSON.parse(stored) : [];
  }

  private getModulePerm(moduleName: string): any {
    return this.getAllPermissions().find(
      (p: any) => p.module_name?.toLowerCase() === moduleName.toLowerCase()
    );
  }

  isAdmin(): boolean {
    const user = localStorage.getItem('user');
    if (!user) return false;
    return JSON.parse(user).is_super_role === true;
  }

  isManager(): boolean {
    const user = localStorage.getItem('user');
    if(!user) return false;
    return JSON.parse(user).role_name === 'Manager';
  }

  canRead(moduleName: string):   boolean { return this.isAdmin() || this.getModulePerm(moduleName)?.can_read   === 1; }
  canWrite(moduleName: string):  boolean { return this.isAdmin() || this.getModulePerm(moduleName)?.can_write  === 1; }
  canDelete(moduleName: string): boolean { return this.isAdmin() || this.getModulePerm(moduleName)?.can_delete === 1; }
  canExport(moduleName: string): boolean { return this.isAdmin() || this.getModulePerm(moduleName)?.can_export === 1; }
  canImport(moduleName: string): boolean { return this.isAdmin() || this.getModulePerm(moduleName)?.can_import === 1; }
  canView(moduleName: string):   boolean { return this.canRead(moduleName); }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
  }

  getRoles() {
    return this.http.get(`${this.api}/permissions/roles`, { headers: this.getHeaders() });
  }

  getModules() {
    return this.http.get(`${this.api}/permissions/modules`, { headers: this.getHeaders() });
  }

  getRolePermissions(roleId: number) {
    return this.http.get(`${this.api}/permissions/role/${roleId}`, { headers: this.getHeaders() });
  }

  saveRolePermissions(roleId: number, permissions: any[]) {
    return this.http.post(`${this.api}/permissions/save-role`,
      { roleId, permissions },
      { headers: this.getHeaders() }
    );
  }

  addEmployee(data: any) {
    return this.http.post(`${this.api}/permissions/add-employee`, data, { headers: this.getHeaders() });
  }
}
