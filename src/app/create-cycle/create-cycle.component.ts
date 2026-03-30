import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, FormArray, ReactiveFormsModule, Validators, NonNullableFormBuilder, FormsModule } from '@angular/forms';
import { NgIf, NgForOf, AsyncPipe } from '@angular/common';
import { debounceTime, Observable, filter, combineLatest, map } from 'rxjs';
import { exercisesArrayData } from '../../exercises';


type FormExercise = FormGroup<{
  exerciseName: FormControl<string>
  exercisePr: FormControl<number>
  exerciseQty80: FormControl<number>
  smallestJump: FormControl<number>
  roundingMode: FormControl<string>
  desiredWeek5: FormControl<number>
}>

type inputForm = FormGroup<{
  programName: FormControl<string>
  exercises: FormArray<FormExercise>
}>

type Exercise = {
  exerciseName: string,
  exercisePr: number,
  exerciseQty80: number,
  smallestJump: number,
  roundingMode: string,
  desiredWeek5: number
}


@Component({
  selector: 'app-create-cycle',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf, NgForOf, AsyncPipe],
  templateUrl: './create-cycle.component.html',
  styleUrl: './create-cycle.component.css'
})
export class CreateCycleComponent {

  private fb = inject(NonNullableFormBuilder)

  exercisesArray = exercisesArrayData

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
      exerciseName: ['', {validators: [Validators.required]}],
      exercisePr: [0, {validators: [Validators.required, Validators.min(1)]}],
      exerciseQty80: [0, {validators: [Validators.required, Validators.min(1), Validators.max(20)]}],
      smallestJump: [0, {validators: [Validators.required, Validators.min(1)]}],
      roundingMode: ['', Validators.required],
      desiredWeek5: [0, {validators: [Validators.required]}]
    })
  }

  onAddExercise(): void {
    this.programInputForm.controls.exercises.push(this.generateExercise())
  }

  onRemoveExercise(exerciseIndex: number) {
    this.programInputForm.controls.exercises.removeAt(exerciseIndex)
  }

  isExerciseFormValid$: Observable<string> = this.programInputForm.controls.exercises.statusChanges

  week5SuggestedWeight: number[] = []

  week5Suggested$ = combineLatest({
    status: this.isExerciseFormValid$,
    exerciseData: this.exercises.valueChanges
  }).pipe(
    debounceTime(100),
    filter((data): data is {
      status: string;
      exerciseData: Exercise[];
    } => data.status === 'VALID'),
    map(({ exerciseData }) => this.week5SuggestedCalculation(exerciseData)
    ))

  usedExercisesArray: string[] = []

  week5SuggestedCalculation(exercises: Exercise[]) {
    return exercises.map((exercise: Exercise) => {
      return exercise.exercisePr * 0.85
    })
  }

  addExerciseToUsed(exercises: Exercise[]) {
    return exercises.map((exercise: Exercise) => {
      return exercise.exerciseName
    })
  }

  desiredWeek5Checked = false;

  isUseOwnWeek5Weight(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked
    if (isChecked) {
      this.desiredWeek5Checked = true
    } else {
      this.desiredWeek5Checked = false
    }
  }
}