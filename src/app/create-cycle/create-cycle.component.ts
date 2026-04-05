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

  jumpPersent = 0
  jumpRaw = 0
  weeklyJump = 0
  week5Load = 0

  onCalculate() {

    this.programInputForm.value.exercises?.map((exercise, index) => {
      if (exercise.exerciseQty80 && exercise.exerciseQty80 <= 5) {
        this.jumpPersent = 0.05
      } else if (exercise.exerciseQty80 && exercise.exerciseQty80 > 5 && exercise.exerciseQty80 <= 8) {
        this.jumpPersent = 0.04
      } else if (exercise.exerciseQty80 && exercise.exerciseQty80 > 8 && exercise.exerciseQty80 < 10) {
        this.jumpPersent = 0.03
      } else {
        this.jumpPersent = 0.02
      }
      
      if (exercise.exercisePr) {
        this.jumpRaw = this.jumpPersent * exercise.exercisePr
      }

      if (exercise.roundingMode && exercise.smallestJump) {
        if (exercise.roundingMode === 'Nearest') {
          this.weeklyJump = Math.round(this.jumpRaw / exercise.smallestJump) * exercise.smallestJump
        }
        if (exercise.roundingMode === 'Up') {
          this.weeklyJump = Math.ceil(this.jumpRaw / exercise.smallestJump) * exercise.smallestJump
        }
        if (exercise.roundingMode === 'Down') {
          this.weeklyJump = Math.floor(this.jumpRaw / exercise.smallestJump) * exercise.smallestJump
        }
      }

        if (exercise.desiredWeek5 && exercise.desiredWeek5 > 0) {
          this.week5Load = exercise.desiredWeek5
        } 
        if (exercise.desiredWeek5 === 0) {
          this.week5Load = this.week5SuggestedWeight[index]
        }

        const calculatedCycle = this.generateCycle(this.week5Load, this.weeklyJump)
        console.log(calculatedCycle) // this row just for outputting cycle data
    })
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
      let suggestedWeek5Load = 0

      if (exercise.roundingMode === 'Nearest') {
        suggestedWeek5Load = Math.round((exercise.exercisePr * 0.85) / exercise.smallestJump) * exercise.smallestJump
      }
      if (exercise.roundingMode === 'Up') {
        suggestedWeek5Load = Math.ceil((exercise.exercisePr * 0.85) / exercise.smallestJump) * exercise.smallestJump
      }
      if (exercise.roundingMode === 'Down') {
        suggestedWeek5Load = Math.floor((exercise.exercisePr * 0.85) / exercise.smallestJump) * exercise.smallestJump
      }

      this.week5SuggestedWeight.push(suggestedWeek5Load)
      return suggestedWeek5Load
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

  

  generateCycle(w5: number, jump: number) {
    const weeklyLoadData: any[] = []

      let week = 0
      let sets = 0
      let reps = 0
      let load = 0

      for (let i = -4; i <= 2; i++) {
        week = i + 5

        if (week <= 5) {
          sets = 5
          reps = 5
        }  else if (week === 6) {
          sets = 3
          reps = 3
        } else {
          sets = 2
          reps = 2
        }

        load = w5 + (i * jump)

        weeklyLoadData.push({week, sets, reps, load})        
      }

      return weeklyLoadData
  }
}