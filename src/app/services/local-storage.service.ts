import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  saveProgramToLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  getProgramFromLocalStorage(key: string) {
    localStorage.getItem(key)
  }
}