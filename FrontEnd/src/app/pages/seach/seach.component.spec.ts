import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeachComponent } from './seach.component';

describe('SeachComponent', () => {
  let component: SeachComponent;
  let fixture: ComponentFixture<SeachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeachComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
