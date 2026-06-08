import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-import-customers',
  imports: [CommonModule, RouterLink],
  templateUrl: './import-customers.html',
  styleUrl: './import-customers.css',
})
export class ImportCustomers {
  selectedFile: File | null = null;

  fileName = 'No Selected File';

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
  ) {}

  onFileChanged(event: any) {
    const file = event.target.files[0];

    if (!file) {
      this.selectedFile = null;
      this.fileName = 'No Selected File';
      return;
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    const allowedExtensions = ['.xlsx', '.xls'];

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
      this.toastr.error('Only Excel files are allowed', 'Invalid File');
      event.target.value = '';
      this.selectedFile = null;
      this.fileName = 'No Selected File';
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;

    this.toastr.success('File Selected for Import', 'Import');
  }

  importExcel() {
    if (!this.selectedFile) {
      this.toastr.info('Select File First', 'Import');

      return;
    }

    const formdata = new FormData();

    formdata.append('file', this.selectedFile);

    this.http
      .post(
        'http://localhost:3000/api/importCustomer',

        formdata,
      )

      .subscribe({
        next: (res: any) => {
          this.toastr.success(
            `${res.insertedCount} Employees Imported`,
            'Excel Imported Successfully',
          );

          if (res.skippedCount > 0) {
            this.toastr.warning(`${res.skippedCount} Rows Skipped`, 'Duplicate Data');
          }
        },

        error: (err) => {
          console.log(err);

          this.toastr.error(
            'Import Failed',

            'Error',
          );
        },
      });
  }
}
