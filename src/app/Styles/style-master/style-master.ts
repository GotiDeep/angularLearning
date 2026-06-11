import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-style-master',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './style-master.html',
  styleUrl: './style-master.css',
})
export class StyleMaster implements OnInit {

  showParameterModal: boolean = false;
  styleForm!: FormGroup;
  ParamForm2!: FormGroup;
  addParameterForm!: FormGroup;

  apiUrl = "http://localhost:3000/api";

  isEditMode: boolean = false;
  styleId: any = null;

  parameterTypes: any[] = [];
  paramTypes: any[] = [];
  masterDropdownData: any[] = [];

  categoriesList: any[] = [];
  subCategoriesList: any[] = [];
  genderList: any[] = [];
  metalList: any[] = [];
  metalKTList: any[] = [];
  diamondTypeList: any[] = [];
  diamondShapeList: any[] = [];
  diamondColorList: any[] = [];
  diamondClarityList: any[] = [];
  diamondSizeList: any[] = [];

  metalRows = [{ metal: '', kt: '', weight: '', amount: '' }];
  addDiamondRows = [{ diamondType: '', shape: '', color: '', clarity: '', size: '', pcs: '', caret: '', amount: '' }];

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
    private http: HttpClient,
    private detect: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadAllParameters();

    this.addParameterForm = this.fb.group({
      newType: ['', Validators.required]
    });

    this.ParamForm2 = this.fb.group({
      typeKey: ['', Validators.required],
      itemLabel: ['', Validators.required],
      parentId: [null],
      isActive: [true]
    });

    this.styleForm = this.fb.group({
      styleNumber: [{ value: '', disabled: true }],
      category: [null, Validators.required],
      subCategory: [null, Validators.required],
      gender: [null, Validators.required],
      productTitle: ['', Validators.required],
      productDescription: [''],
      status: [true]
    });
  }

  checkRouteParams() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.styleId = id;
        this.fetchAndPatchStyleData(id);
      } else {
        this.isEditMode = false;
        this.styleId = null;
        this.styleForm.reset({
          styleNumber: '',
          category: null,
          subCategory: null,
          gender: null,
          productTitle: '',
          productDescription: '',
          status: true
        });
        this.metalRows = [{ metal: '', kt: '', weight: '', amount: '' }];
        this.addDiamondRows = [{ diamondType: '', shape: '', color: '', clarity: '', size: '', pcs: '', caret: '', amount: '' }];
        this.getNextId();
      }
    });
  }

  fetchAndPatchStyleData(styleId: any) {
    this.http.get<any>(`${this.apiUrl}/getStyleById/${styleId}`).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const main = res.data.master;
          const metals = res.data.metals || [];
          const diamonds = res.data.diamonds || [];

          const categoryObj = this.categoriesList.find((item: any) => item.param_id == main.category_id);

          if (main.category_id) {
            this.subCategoriesList = this.masterDropdownData.filter((item: any) =>
              item.key_param === 'SUB_CATEGORY' && item.parent_id == main.category_id
            );
          } else {
            this.subCategoriesList = [];
          }

          const subCategoryObj = this.subCategoriesList.find((item: any) => item.param_id == main.sub_category_id);

          const genderObj = this.genderList.find((item: any) => item.param_id == main.gender_id);


          this.styleForm.patchValue({
            styleNumber: main.style_number,
            category: categoryObj || null,
            subCategory: subCategoryObj || null,
            gender: genderObj || null,
            productTitle: main.product_title,
            productDescription: main.product_description,
            status: main.statuss === 1 ? true : false
          });

          this.metalRows = metals.length > 0 ? metals : [{ metal: '', kt: '', weight: '',amount:'' }];
          this.addDiamondRows = diamonds.length > 0 ? diamonds : [{ diamondType: '', shape: '', color: '', clarity: '', size: '', pcs: '', caret: '',amount:'' }];

          this.detect.detectChanges();
        }
      },
      error: (err) => {
        this.toast.error("Failed to load details for editing");
      }
    });
  }

  SaveDetails() {

    if (this.addDiamondRows.length > 0) {
    const invalidDiamondRow = this.addDiamondRows.find(row =>
      !row.diamondType || !row.shape || !row.color || !row.clarity || !row.size || !row.pcs || !row.caret || !row.amount || row.amount.toString().trim() === '');
    if (invalidDiamondRow) {
      this.toast.error('Please fill all Diamond Details row fields', 'Validation Error');
      return;
    }
  }
    if (this.styleForm.invalid) {
      this.styleForm.markAllAsTouched();
      this.toast.error('Please fill all required fields in the main form', 'Validation Error');
      return;
    }

    for (let i = 0; i < this.metalRows.length; i++) {
      const row = this.metalRows[i];
      if (!row.metal || !row.kt || !row.weight || row.weight.toString().trim() === '' || !row.amount || row.amount.toString().trim() === '' ) {
        this.toast.error(`Please complete all fields in Metal Details at row number ${i + 1}`, 'Validation Error');
        return;
      }
    }

    const finalPayload: any = {
      ...this.styleForm.value,
      styleNumber: this.styleForm.get('styleNumber')?.value,
      metals: this.metalRows,
      diamonds: this.addDiamondRows
    };

    if (this.isEditMode) {
      finalPayload.id = this.styleId;
    }

    console.log('Sending Perfect Validated Payload:', finalPayload);

    const saveObs = this.isEditMode
      ? this.http.put<any>(`${this.apiUrl}/updateStyle/${this.styleId}`, finalPayload)
      : this.http.post<any>(`${this.apiUrl}/saveStyleDetails`, finalPayload);

    saveObs.subscribe({
      next: (res: any) => {
        if(res.success){
          this.toast.success(res.message, 'Success');
          this.styleForm.reset();
          this.metalRows = [{ metal: '', kt: '', weight: '', amount: '' }];
          this.addDiamondRows = [{ diamondType: '', shape: '', color: '', clarity: '', size: '', pcs: '', caret: '', amount: '' }];
          if (!this.isEditMode) {
            this.getNextId();
          }
          this.router.navigate(['/styleListing']);
        }else{
          this.toast.error(res.message, 'Error');
        }
      },
      error: (error) => {
        console.log("Error saving style package: ", error);
        this.toast.error('Something went wrong on the server', 'Error');
      }
    });
  }

  addNewRow() {
    this.metalRows.push({ metal: '', kt: '', weight: '', amount: '' });
  }

  deleteRow(index: any) {
    if (this.metalRows.length > 1) {
      this.metalRows.splice(index, 1);
      this.toast.warning('Row removed from list', 'Delete');
    } else {
      this.metalRows = [{ metal: '', kt: '', weight: '', amount: '' }];
      this.toast.info('You need at least one metal row', 'Info');
    }
  }


  getCenterDiamondId(): number | null {
    const centerItem = this.diamondTypeList.find(
      item => item.param_code === 'CENTER_DIAMOND'
    );
    return centerItem ? +centerItem.param_id : null;
  }

  isCenterDiamondSelected(): boolean {
    const centerDiamondId = this.getCenterDiamondId();
    if (centerDiamondId === null) return false;

    return this.addDiamondRows.some(row => row.diamondType && +row.diamondType === centerDiamondId);
  }

  addDiamondRow() {
    const isCenterExists = this.isCenterDiamondSelected();
    let defaultType = '';

    if (isCenterExists) {
      const sideItem = this.diamondTypeList.find(
        item => item.param_code === 'SIDE_DIAMOND'
      );
      defaultType = sideItem ? sideItem.param_id.toString() : '';
    }

    this.addDiamondRows.push({ 
      diamondType: defaultType, 
      shape: '', 
      color: '', 
      clarity: '', 
      size: '', 
      pcs: '', 
      caret: '',
      amount: ''
    });
  }

  deleteDiamondRow(index: any) {
    this.addDiamondRows.splice(index, 1);
  }

  getNextId() {
    this.http.get<any>(`${this.apiUrl}/getNextId`).subscribe({
      next: (res: any) => {
        this.styleForm.get('styleNumber')?.patchValue(res.styleNumber);
      },
      error: (error) => {
        console.log("Error ", error);
      }
    });
  }

  createNewParameter() {
    if (this.addParameterForm.invalid) {
      this.addParameterForm.markAllAsTouched();
      return;
    }

    this.http.post<any>(`${this.apiUrl}/createNewParameter`, this.addParameterForm.value).subscribe({
      next: (res: any) => {
        this.toast.success('Parameter Type Group Created', 'Success');
        this.showParameterModal = false;
        this.addParameterForm.reset();
        this.showParameterModel(); // Reload groups mapping
      },
      error: (err: any) => {
        const backendMessage = err?.error?.message || err?.error || 'Something went wrong';
        this.toast.error(backendMessage, 'Error');
      }
    });
  }

  showParameterModel() {
    this.http.get<any>(`${this.apiUrl}/getParams`).subscribe({
      next: (res: any) => {
        this.parameterTypes = res;
        this.showParameterModal = true; // FIXED: Open state secure on load trigger
      },
      error: (error) => {
        console.log("Error loading parameters ", error);
      }
    });
  }

  onTypeChange(event: any) {
    const param_id = event?.param_id;
    console.log("Selected Param Type ID: ", param_id);

    if (!param_id) {
      this.paramTypes = [];
      this.ParamForm2.get('parentId')?.patchValue(null);
      return;
    }

    this.http.get<any>(`${this.apiUrl}/getParentParams/${param_id}`).subscribe({
      next: (res: any) => {
        this.paramTypes = res;
        this.ParamForm2.get('parentId')?.patchValue(null);
      },
      error: (error) => {
        console.log("Error fetching child parameters: ", error);
        this.paramTypes = [];
      }
    });
  }

  saveParent() {
    if (this.ParamForm2.invalid) {
      this.ParamForm2.markAllAsTouched();
      return;
    }

    this.http.post<any>(`${this.apiUrl}/addParamValues`, this.ParamForm2.value).subscribe({
      next: (res: any) => {
        this.toast.success('Parameter Created Successfully', 'Success');
        this.showParameterModal = false;
        this.ParamForm2.reset({ isActive: true });
        this.loadAllParameters(); // Sync layout immediately
      },
      error: (err: any) => {
        const backendMessage = err?.error?.message || err?.error || 'Something went wrong';
        this.toast.error(backendMessage, 'Error');
      }
    });
  }

  loadAllParameters() {
    this.http.get<any>(`${this.apiUrl}/loadAllParameters`).subscribe({
      next: (res: any) => {
        this.masterDropdownData = res;
        this.categoriesList = res.filter((item: any) => item.key_param === 'CATEGORY');
        this.genderList = res.filter((item: any) => item.key_param === 'GENDER');
        this.metalList = res.filter((item: any) => item.key_param === 'METAL_TYPE');
        this.metalKTList = res.filter((item: any) => item.key_param === 'METAL_KT');
        this.diamondTypeList = res.filter((item: any) => item.key_param === 'DIAMOND_TYPE');
        this.diamondShapeList = res.filter((item: any) => item.key_param === 'DIAMOND_SHAPE');
        this.diamondColorList = res.filter((item: any) => item.key_param === 'DIAMOND_COLOR');
        this.diamondClarityList = res.filter((item: any) => item.key_param === 'DIAMOND_CLARITY');
        this.diamondSizeList = res.filter((item: any) => item.key_param === 'DIAMOND_SIZE');
        this.detect.detectChanges();
        this.checkRouteParams();
      },
      error: (err: any) => {
        console.log("Error on Master Loading: ", err);
      }
    });
  }

  onMainCategoryChange(selectedCategory: any) {
    if (selectedCategory && selectedCategory.param_id) {
      const categoryId = selectedCategory.param_id;
      this.subCategoriesList = this.masterDropdownData.filter((item: any) =>
        item.key_param === 'SUB_CATEGORY' && item.parent_id === categoryId
      );
    } else {
      this.subCategoriesList = [];
    }
    this.styleForm.get('subCategory')?.patchValue(null);
  }

}