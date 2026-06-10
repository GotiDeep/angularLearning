import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../services/permission';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permissions.html',
  styleUrl: './permissions.css'
})
export class Permissions implements OnInit {

  roles: any[] = [];
  modules: any[] = [];
  selectedRole: any = null;
  permissionMatrix: any = {};
  isLoading = false;

  showAddEmployeeModal = false;
  newEmployee = { firstname: '', lastname: '', email: '', mobile: '', password: '', confirmPassword: '', role_id: '' };

  showAddModuleModal = false;
  newModule = { module_name: '', module_category: '', description: '', is_active: true };

  constructor(
    private permService: PermissionService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRoles();
    this.loadModules();
  }

  loadRoles(): void {
    this.permService.getRoles().subscribe({
      next: (res: any) => {
        let roles = res.roles || [];

        roles = roles.filter((r: any) => !r.is_super_role);

        if (!this.permService.isAdmin()) {
          roles = roles.filter((r: any) => r.role_name.toLowerCase() === 'employee');
        }

        this.roles = roles;
        this.cdr.detectChanges();
      },
      error: () => this.toastr.error('Failed to load roles')
    });
  }


  loadModules(): void {
    this.permService.getModules().subscribe({
      next: (res: any) => { this.modules = res.modules; this.cdr.detectChanges(); },
      error: () => this.toastr.error('Failed to load modules')
    });
  }

  configureRole(role: any): void {
    this.selectedRole = role;
    this.permissionMatrix = {};
    this.isLoading = true;

    this.permService.getRolePermissions(role.role_id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        res.permissions.forEach((p: any) => {
          this.permissionMatrix[p.module_id] = {
            canRead: p.can_read === 1,
            canWrite: p.can_write === 1,
            canDelete: p.can_delete === 1,
            canExport: p.can_export === 1,
            canImport: p.can_import === 1
          };
        });
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); this.toastr.error('Failed to load permissions'); }
    });
  }

  getPerm(moduleId: number, permType: string): boolean {
    return this.permissionMatrix[moduleId]?.[permType] || false;
  }


  togglePerm(moduleId: number, permType: string): void {
    if (!this.permissionMatrix[moduleId]) {
      this.permissionMatrix[moduleId] = { canRead: false, canWrite: false, canDelete: false, canExport: false, canImport: false };
    }

    this.permissionMatrix[moduleId][permType] = !this.permissionMatrix[moduleId][permType];

    if (permType !== 'canRead' && this.permissionMatrix[moduleId][permType]) {
      this.permissionMatrix[moduleId]['canRead'] = true;
    }

    if (permType === 'canRead' && !this.permissionMatrix[moduleId][permType]) {
      this.permissionMatrix[moduleId] = { canRead: false, canWrite: false, canDelete: false, canExport: false, canImport: false };
    }
  }

  selectAll(moduleId: number): void {
    this.permissionMatrix[moduleId] = { canRead: true, canWrite: true, canDelete: true, canExport: true, canImport: true };
  }

  savePermissions(): void {
    if (!this.selectedRole) return;

    const permissionsArray = Object.keys(this.permissionMatrix).map(moduleId => ({
      moduleId: parseInt(moduleId),
      canRead: this.permissionMatrix[moduleId].canRead,
      canWrite: this.permissionMatrix[moduleId].canWrite,
      canDelete: this.permissionMatrix[moduleId].canDelete,
      canExport: this.permissionMatrix[moduleId].canExport,
      canImport: this.permissionMatrix[moduleId].canImport
    }));

    this.permService.saveRolePermissions(this.selectedRole.role_id, permissionsArray).subscribe({
      next: () => {
        this.toastr.success('Permissions Saved!');
        this.router.navigate(['/styleListing']);
      },
      error: () => this.toastr.error('Failed to save permissions')
    });
  }

  openAddEmployee(): void { this.newEmployee = { firstname: '', lastname: '', email: '', mobile: '', password: '', confirmPassword: '', role_id: '' }; this.showAddEmployeeModal = true; }
  closeAddEmployee(): void { this.showAddEmployeeModal = false; }

  saveEmployee(): void {
    const { firstname, email, password, confirmPassword, role_id } = this.newEmployee;
    if (!firstname || !email || !password || !role_id) { this.toastr.warning('Please fill required fields'); return; }
    if (password !== confirmPassword) { this.toastr.error('Passwords do not match'); return; }

    this.permService.addEmployee(this.newEmployee).subscribe({
      next: () => { this.toastr.success('Employee Added!'); this.closeAddEmployee(); },
      error: (err) => this.toastr.error(err.error?.message || 'Failed to add employee')
    });
  }

  openAddModule(): void { this.newModule = { module_name: '', module_category: '', description: '', is_active: true }; this.showAddModuleModal = true; }
  closeAddModule(): void { this.showAddModuleModal = false; }

  saveModule(): void {
    if (!this.newModule.module_name || !this.newModule.module_category) { this.toastr.warning('Module Name and Category are required'); return; }
    this.toastr.info('Module API coming soon!');
    this.closeAddModule();
  }

  backtohome(): void { this.router.navigate(['/styleListing']); }
  AddModule(): void { this.openAddModule(); }
}