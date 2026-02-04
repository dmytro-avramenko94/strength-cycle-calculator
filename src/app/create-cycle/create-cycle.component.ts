import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-create-cycle',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './create-cycle.component.html',
  styleUrl: './create-cycle.component.css'
})
export class CreateCycleComponent {
  programInputForm = new FormGroup({
    programName: new FormControl('', Validators.required),
  })

  savedProgramName: string | null = null

  disabledButton: boolean = false

  get programName() {
    return this.programInputForm.get('programName') as FormControl
  }

  save() {
    if (this.programName.invalid) {
      this.disabledButton = true
      return
    } else {
      this.disabledButton = false
      this.savedProgramName = this.programName.value
      this.programName.reset()   
    }

     
  }

}
