import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, FormArray, ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { NgIf } from '@angular/common';

type FormExercise = FormGroup<{
  exerciseName: FormControl<string>
  exercisePr: FormControl<number>
  exerciseQty80: FormControl<number>
}>

type inputForm = FormGroup<{
  programName: FormControl<string>
  exercises: FormArray<FormExercise>
}>


@Component({
  selector: 'app-create-cycle',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './create-cycle.component.html',
  styleUrl: './create-cycle.component.css'
})
export class CreateCycleComponent {

  fb = inject(NonNullableFormBuilder)

  programInputForm: inputForm = this.fb.group({
    programName: this.fb.control('', {validators: [Validators.required]}),
    exercises: this.fb.array<FormExercise>([this.generateExercise()])
  })

  savedProgramName: string | null = null

  onCalculate() {
    if(this.programInputForm.controls.programName.invalid) return

    this.savedProgramName = this.programInputForm.controls.programName.value
    
    console.log(this.programInputForm.getRawValue());
    this.programInputForm.controls.programName.reset()
  }

  generateExercise(): FormExercise {
    return this.fb.group({
      exerciseName: '',
      exercisePr: 0,
      exerciseQty80: 0
    })
  }

  onAddExercise(): void {
    this.programInputForm.controls.exercises.push(this.generateExercise())
  }

  onRemoveExercise(exerciseIndex: number) {
    this.programInputForm.controls.exercises.removeAt(exerciseIndex)
  }


  // programInputForm = new FormGroup({
  //   programName: new FormControl('', Validators.required),
  //   // exercises: new FormArray<FormExercise>([this.onAddExercise()])
  // })

  // savedProgramName: string | null = null

  // disabledButton: boolean = false

  // get programName() {
  //   return this.programInputForm.get('programName') as FormControl
  // }

  // onCalculate() {
  //   if (this.programName.invalid) {
  //     this.disabledButton = true
  //     return
  //   } else {
  //     this.disabledButton = false
  //     this.savedProgramName = this.programName.value
  //     this.programName.reset()   
  //   }
  // }

  // onSubmit() {
  //   console.log(this.programInputForm.getRawValue());
  // }
}
