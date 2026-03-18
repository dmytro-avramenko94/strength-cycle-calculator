import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, FormArray, ReactiveFormsModule, Validators, NonNullableFormBuilder, FormsModule } from '@angular/forms';
import { NgIf, NgForOf } from '@angular/common';
import { exercisesArray } from '../../exercises';
import { debounceTime, Observable, filter, combineLatest, map } from 'rxjs';


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

type Exercise = {
  exerciseName: string,
  exercisePr: number,
  exerciseQty80: number,
  smallestJump: number,
  roundingMode: string
}


@Component({
  selector: 'app-create-cycle',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf, NgForOf],
  templateUrl: './create-cycle.component.html',
  styleUrl: './create-cycle.component.css'
})
export class CreateCycleComponent {

  private fb = inject(NonNullableFormBuilder)

  exercisesArray = exercisesArray

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
      exerciseName: ['Deadlift', Validators.required],
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

  isExerciseFormValid$: Observable<string> = this.programInputForm.controls.exercises.statusChanges

  week5SuggestedWeight: number[] = []

  week5Suggested$: Observable<any> = this.exercises.valueChanges

  week5SuggestedCalculation(exercises: Exercise[]) {
    return exercises.map((exercise: Exercise) => {
      return exercise.exercisePr * 0.85
    })
  }

  ngOnInit() {
    combineLatest({
      status: this.isExerciseFormValid$, 
      data: this.week5Suggested$
    }).pipe(
      debounceTime(100),
      filter(({status}) => status === 'VALID')
    )
    .subscribe(({data}) => {
      this.week5SuggestedWeight = this.week5SuggestedCalculation(data)
    })
  }
}