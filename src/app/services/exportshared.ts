import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Exportshared {

  private selectedIds = new BehaviorSubject<number[]>([]);

  selectedId$ = this.selectedIds.asObservable();

  setSelectedIds(ids: number[]){
    this.selectedIds.next(ids);
  }
}
