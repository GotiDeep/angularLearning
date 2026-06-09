import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { PermissionService } from '../../services/permission';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permissions.html',
  styleUrl: './permissions.css'
})
export class Permissions implements OnInit {

  // ─── State Variables ───
  users: any[] = [];           // Sabhi users ki list
  modules: any[] = [];         // Sabhi modules ki list
  selectedUser: any = null;    // Jis user ki permission configure kar rahe hain
  permissionMatrix: any = {};  // { moduleId: { canRead, canWrite, ... } }
  isLoading = false;           // Loading spinner ke liye

  constructor(
    private permService: PermissionService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router  // logout ke baad /login pe navigate karne ke liye
  ) {}

  ngOnInit(): void {
    // Component load hote hi users aur modules fetch karo
    this.loadUsers();
    this.loadModules();
  }

  // ─────────────────────────────────────────────────
  // LOAD USERS
  // Backend se sabhi users lo (Admin → sab, Manager → apne employees)
  // ─────────────────────────────────────────────────
  loadUsers(): void {
    this.permService.getUsers().subscribe({
      next: (res: any) => {
        this.users = res.users;
        // cdr.detectChanges() → Angular ko batao ki data change hua hai
        // Ye ExpressionChangedAfterItHasBeenCheckedError fix karta hai
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Failed to load users');
        console.error(err);
      }
    });
  }

  // ─────────────────────────────────────────────────
  // LOAD MODULES
  // Backend se sabhi active modules lo
  // ─────────────────────────────────────────────────
  loadModules(): void {
    this.permService.getModules().subscribe({
      next: (res: any) => {
        this.modules = res.modules;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Failed to load modules');
      }
    });
  }

  // ─────────────────────────────────────────────────
  // CONFIGURE PERMISSION (jab "Configure" button click ho)
  // 1. Selected user set karo
  // 2. Us user ki existing permissions fetch karo
  // 3. Permission matrix banao
  // ─────────────────────────────────────────────────
  configureUser(user: any): void {
    this.selectedUser = user;
    this.permissionMatrix = {};   // Pehle clear karo

    this.isLoading = true;

    this.permService.getUserPermissions(user.user_id).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        // Matrix banao: { moduleId: { canRead, canWrite, ... } }
        // forEach → har permission ke liye module_id ko key banao
        res.permissions.forEach((perm: any) => {
          this.permissionMatrix[perm.module_id] = {
            canRead:   perm.can_read === 1,
            canWrite:  perm.can_write === 1,
            canDelete: perm.can_delete === 1,
            canExport: perm.can_export === 1,
            canImport: perm.can_import === 1
          };
        });

        // ← YE ZAROORI HAI!
        // isLoading = false aur matrix data dono ke baad Angular ko batao ki UI update karo
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges(); // ← Error pe bhi detectChanges chahiye
        this.toastr.error('Failed to load permissions');
        console.error(err);
      }
    });
  }

  // ─────────────────────────────────────────────────
  // GET PERMISSION VALUE
  // Template mein checkbox ke liye value lo
  // ─────────────────────────────────────────────────
  getPerm(moduleId: number, permType: string): boolean {
    return this.permissionMatrix[moduleId]?.[permType] || false;
  }

  // ─────────────────────────────────────────────────
  // TOGGLE PERMISSION
  // Jab checkbox click hota hai
  // ─────────────────────────────────────────────────
  togglePerm(moduleId: number, permType: string): void {
    // Agar module ki entry nahi hai → banao
    if (!this.permissionMatrix[moduleId]) {
      this.permissionMatrix[moduleId] = {
        canRead: false, canWrite: false,
        canDelete: false, canExport: false, canImport: false
      };
    }
    // Toggle (true → false, false → true)
    this.permissionMatrix[moduleId][permType] = !this.permissionMatrix[moduleId][permType];

    // ─── Read Required Rule ───
    // Agar Write/Delete/Export/Import ON kiya → Read bhi ON karna zaroori hai
    if (permType !== 'canRead' && this.permissionMatrix[moduleId][permType]) {
      this.permissionMatrix[moduleId]['canRead'] = true;
    }
    // Agar Read OFF kiya → sab OFF kar do
    if (permType === 'canRead' && !this.permissionMatrix[moduleId][permType]) {
      this.permissionMatrix[moduleId] = {
        canRead: false, canWrite: false,
        canDelete: false, canExport: false, canImport: false
      };
    }
  }

  // ─────────────────────────────────────────────────
  // SELECT ALL for a module
  // ─────────────────────────────────────────────────
  selectAll(moduleId: number): void {
    this.permissionMatrix[moduleId] = {
      canRead: true, canWrite: true,
      canDelete: true, canExport: true, canImport: true
    };
  }

  // ─────────────────────────────────────────────────
  // SAVE PERMISSIONS
  // Matrix ko array mein convert karo aur backend ko bhejo
  // ─────────────────────────────────────────────────
  savePermissions(): void {
    if (!this.selectedUser) return;

    // Object ko Array mein convert karo
    // Object.keys → matrix ke sab moduleId lo
    const permissionsArray = Object.keys(this.permissionMatrix).map(moduleId => ({
      moduleId: parseInt(moduleId),
      canRead:   this.permissionMatrix[moduleId].canRead,
      canWrite:  this.permissionMatrix[moduleId].canWrite,
      canDelete: this.permissionMatrix[moduleId].canDelete,
      canExport: this.permissionMatrix[moduleId].canExport,
      canImport: this.permissionMatrix[moduleId].canImport
    }));

    this.permService.savePermissions(this.selectedUser.user_id, permissionsArray).subscribe({
      next: (res: any) => {
        this.toastr.success('Permissions Saved Successfully!');
      },
      error: (err) => {
        this.toastr.error('Failed to save permissions');
        console.error(err);
      }
    });
  }

  backtohome(){
    this.router.navigate(['/styleListing']);
  } 

}
