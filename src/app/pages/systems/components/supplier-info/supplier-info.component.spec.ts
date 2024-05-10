import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierInfoComponent } from './supplier-info.component';

describe('SupplierInfoComponent', () => {
  let component: SupplierInfoComponent;
  let fixture: ComponentFixture<SupplierInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
