import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-import',
  imports: [RouterLink],
  templateUrl: './import.html',
  styleUrl: './import.css',
})
export class Import {
  selectedFile : File | null = null;

  fileName = 'No Selected File';

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
  ) {}

  onFileChanged(event: any) {
    const file = event.target.files[0];
    this.toastr.success('File Selected for Import', 'Import');
    if (file) {
      this.selectedFile = file;
      this.fileName = file.name;
    }
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
        'http://localhost:3000/api/importexcel',

        formdata,
      )

      .subscribe({
        next: (res: any) => {
          console.log(res);

          this.toastr.success(
            'Excel Imported Successfully',

            'Success',
          );

          this.toastr.success(
            `${res.insertedCount} Employees Imported`,

            'Success',
          );

          if (res.skippedCount > 0) {
            this.toastr.warning(
              `${res.skippedCount} Rows Skipped`,

              'Duplicate Data',
            );
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
