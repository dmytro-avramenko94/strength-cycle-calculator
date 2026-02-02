import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-create-cycle',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './create-cycle.component.html',
  styleUrl: './create-cycle.component.css'
})
export class CreateCycleComponent {
  programName = new FormControl('', Validators.required)

  savedProgramName: string | null = null

  save() {
    if (this.programName.invalid) return

    this.savedProgramName = this.programName.value
    this.programName.reset()    
  }

  
}
