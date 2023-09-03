import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoConverterComponent } from './video-converter.component';

describe('VideoConverterComponent', () => {
  let component: VideoConverterComponent;
  let fixture: ComponentFixture<VideoConverterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoConverterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
