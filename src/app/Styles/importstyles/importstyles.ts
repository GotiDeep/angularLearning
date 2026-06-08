import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-importstyles',
  imports: [CommonModule, RouterLink],
  templateUrl: './importstyles.html',
  styleUrl: './importstyles.css',
})
export class Importstyles {

  showPreviewModal = false;

  previewRows: any[] = [];

  totalRows = 0;
  validRows = 0;
  errorRows = 0;
  warnRows = 0;

  selectedFile: File | null = null;

  fileName = 'No Selected File';

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private detect: ChangeDetectorRef,
    private router: Router
  ) { }

  onFileChanged(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileName = file.name;
      this.toastr.success('File Selected for Import', 'Import');
    }
  }

  confirmImport() {
    if (!this.selectedFile) {
      this.toastr.info('Select File First', 'Import');
      return;
    }

    if (this.errorRows > 0) {
      this.toastr.error('Please fix errors before import', 'Validation Error');
      return;
    }

    const formdata = new FormData();
    formdata.append('file', this.selectedFile);

    this.http.post('http://localhost:3000/api/importStyles', formdata)
      .subscribe({
        next: (res: any) => {
          this.toastr.success('Styles Imported Successfully', 'Success');
          this.toastr.success(`${res.insertedCount} Styles Imported`, 'Success');
          this.detect.detectChanges();
          this.router.navigate(['/styleListing'])
          this.showPreviewModal = false;
        },
        error: (err) => {
          console.log(err);
          this.toastr.error(err?.error?.error || 'Import Failed', 'Error');
        }
      });
  }

  closePreviewModal() {
    this.showPreviewModal = false;
  }

  importExcel() {
    if (!this.selectedFile) {
      this.toastr.info('Select File First', 'Import');
      return;
    }

    const formdata = new FormData();
    formdata.append('file', this.selectedFile);

    this.http.post('http://localhost:3000/api/previewImportStyles', formdata)
      .subscribe({
        next: (res: any) => {
          console.log('Preview Response:', res);
          
          // Map the data properly - check if rows exist
          this.previewRows = res.rows || [];
          this.totalRows = res.totalRows || 0;
          this.validRows = res.validRows || 0;
          this.errorRows = res.errorRows || 0;
          this.warnRows = res.warnRows || 0;
          
          // Log to verify data is assigned
          console.log('Preview Rows Count:', this.previewRows.length);
          console.log('First Row:', this.previewRows[0]);
          
          // Force show modal
          this.showPreviewModal = true;
          
          // Force change detection
          this.detect.detectChanges();
          
          console.log('Modal visible:', this.showPreviewModal);
          
          this.toastr.success('Preview Generated Successfully', 'Preview');

          if (this.errorRows > 0) {
            this.toastr.warning(`${this.errorRows} Rows Have Errors`, 'Validation');
          }

          if (this.warnRows > 0) {
            this.toastr.warning(`${this.warnRows} Rows Will Be Skipped`, 'Warning');
          }
        },
        error: (err) => {
          console.log('Preview Error:', err);
          this.toastr.error('Preview Failed', 'Error');
        }
      });
  }
}