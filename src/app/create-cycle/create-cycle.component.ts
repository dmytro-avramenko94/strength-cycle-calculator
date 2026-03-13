import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, FormArray, ReactiveFormsModule, Validators, NonNullableFormBuilder, FormsModule } from '@angular/forms';
import { NgIf, NgForOf } from '@angular/common';
import { exercisesArray } from '../../exercises';
import { debounceTime, Observable, filter } from 'rxjs';


type FormExercise = FormGroup<{
  exerciseName: FormControl<string>
  exercisePr: FormControl<number>
  exerciseQty80: FormControl<number>
  smallestJump: FormControl<number>
  roundingMode: FormControl<string>
}>

type inputForm = FormGroup<{
  programName: FormControl<string>
  exercises: FormArray<FormExercise>
}>


@Component({
  selector: 'app-create-cycle',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf, NgForOf],
  templateUrl: './create-cycle.component.html',
  styleUrl: './create-cycle.component.css'
})
export class CreateCycleComponent {

  private fb = inject(NonNullableFormBuilder)

  get exercises() {
   return this.programInputForm.controls.exercises;
  }

  get isProgramNameValid(): boolean {
    return (this.programInputForm.controls.programName.touched &&
      this.programInputForm.controls.programName.invalid
    )
  }

  programInputForm: inputForm = this.fb.group({
    programName: this.fb.control('', {validators: [Validators.required]}),
    exercises: this.fb.array<FormExercise>([this.generateExercise()])
  })

  onCalculate() {
    if(this.programInputForm.controls.programName.invalid) return
    
    console.log(this.programInputForm.getRawValue());
  }

  generateExercise(): FormExercise {
    return this.fb.group({
      exerciseName: ['', Validators.required],
      exercisePr: [0, {validators: [Validators.required, Validators.min(1)]}],
      exerciseQty80: [0, {validators: [Validators.required, Validators.min(1), Validators.max(20)]}],
      smallestJump: [0, {validators: [Validators.required, Validators.min(1)]}],
      roundingMode: ['', Validators.required]
    })
  }

  onAddExercise(): void {
    this.programInputForm.controls.exercises.push(this.generateExercise())
  }

  onRemoveExercise(exerciseIndex: number) {
    this.programInputForm.controls.exercises.removeAt(exerciseIndex)
  }

  exercisesArray = exercisesArray

  week5Suggested$: Observable<any> = this.exercises.valueChanges.pipe(
      debounceTime(100),
      filter((exercises) => exercises.every(exercise => 
        exercise.exerciseName && 
        exercise.exerciseName.length >= 2 &&
        exercise.exercisePr &&
        exercise.exercisePr >= 1 &&
        exercise.smallestJump &&
        exercise.smallestJump >= 1 &&
        exercise.roundingMode
        )),
      )

  week5SuggestedCalculation(exercises: any[]) {
    return exercises.map((exercise: any) => {
      const week5Weight = exercise.exercisePr * 0.85
      return week5Weight
    })
  }

  week5SuggestedWeight: number[] = []

  ngOnInit() {
    this.week5Suggested$.subscribe((data) => {
      this.week5SuggestedWeight = this.week5SuggestedCalculation(data)
    });
  }
}

// Should I create type for "exercise" (for using in observeble) ?
// Should I create separate function for the form validation (and can I use it inside the pipe)?