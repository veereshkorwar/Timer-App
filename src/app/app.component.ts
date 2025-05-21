import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { map, Subject, switchMap, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {

  secondsLeft: number | null = null;
  private destroy$ = new Subject<void>();


  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.http.get<{ secondsLeft: number }>('/api/deadline')
      .pipe(
        switchMap(response => {
          const initial = response.secondsLeft;

          return timer(0, 1000).pipe(
            map(elapsed => initial - elapsed),
            takeUntil(this.destroy$)
          );
        })
      )
      .subscribe(seconds => {
        this.secondsLeft = Math.max(seconds, 0); // Prevent negative values
        this.cdr.markForCheck(); // Trigger OnPush update
      });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
