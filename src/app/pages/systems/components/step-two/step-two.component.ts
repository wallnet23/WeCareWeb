import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UploadImageService } from '../../../../services/upload-images.service';
import { ConnectServerService } from '../../../../services/connect-server.service';
import { ApiResponse } from '../../../../interfaces/api-response';
import { Connect } from '../../../../classes/connect';
import { PopupDialogService } from '../../../../services/popup-dialog.service';
import { Country } from '../../../../interfaces/country';
import { StepTwo } from '../interfaces/step-two';
import { Image } from '../interfaces/image';

@Component({
  selector: 'app-step-two',
  standalone: true,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  imports: [
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './step-two.component.html',
  styleUrl: './step-two.component.scss'
})
export class StepTwoComponent {

  @Input() idsystem = 0;
  selectedFilesStep2: File[] = [];
  maxImagesStep2: number = 6;
  isImagesStep2: boolean = false;
  imageSpaceLeftStep2: boolean = true;
  imagesStep2: Image[] = [];
  countriesData: Country[] = [];
  urlServerLara = Connect.urlServerLara;

  stepTwoForm = this.formBuilder.group({
    ccn3: new FormControl<string | null>(null, Validators.required),
    location_address: new FormControl<string>('', Validators.required),
    location_city: new FormControl<string>('', Validators.required),
    location_postalcode: new FormControl<string>('', Validators.required)
  });

  ngOnInit() {
    this.connectServerService.getRequestCountryData().subscribe((obj) => {
      this.countriesData = obj;
    })
    this.infoStep();
    this.getImages();
  }

  constructor(private formBuilder: FormBuilder, private uploadImageService: UploadImageService,
    private connectServerService: ConnectServerService, private popupDialogService: PopupDialogService) { }

  infoStep() {
    this.connectServerService.getRequest<ApiResponse<{ stepTwo: StepTwo }>>(Connect.urlServerLaraApi, 'system/infoStepTwo', { id: this.idsystem }).
      subscribe((val: ApiResponse<{ stepTwo: StepTwo }>) => {
        if (val.data && val.data.stepTwo) {
          this.stepTwoForm.patchValue(val.data.stepTwo);
          console.log(val.data.stepTwo.ccn3);
        }
      })
  }

  saveStep() {
    let stepTwo = JSON.parse(JSON.stringify(this.stepTwoForm.getRawValue()));
    let country$: Observable<Country>;
    let country: Country;
    //console.log("CCN3: ", this.stepTwoForm.get('ccn3')?.value!)
    if (stepTwo.ccn3) {
      country$ = this.connectServerService.getSpecificCountryData(this.stepTwoForm.get('ccn3')?.value!);
      country$.subscribe((val: any) => {
        if (val && val.length > 0) {
          country = { name: { common: val[0].name.common }, cca2: val[0].cca2, ccn3: val[0].ccn3 };
          //console.log(country);
          delete stepTwo.ccn3;
          stepTwo.location_country = country;

          this.connectServerService.postRequest<ApiResponse<null>>(Connect.urlServerLaraApi, 'system/saveStepTwo',
            {
              idsystem: this.idsystem,
              obj_step: stepTwo,
            })
            .subscribe((val: ApiResponse<null>) => {
              this.popupDialogService.alertElement(val);
              this.infoStep();
            })
        }
      })
    }
    else {
      country = { name: { common: '' }, cca2: '', ccn3: '' };
      delete stepTwo.ccn3;
      stepTwo.location_country = country;

      this.connectServerService.postRequest<ApiResponse<null>>(Connect.urlServerLaraApi, 'system/saveStepTwo',
        {
          idsystem: this.idsystem,
          obj_step: stepTwo,
        })
        .subscribe((val: ApiResponse<null>) => {
          this.popupDialogService.alertElement(val);
          this.infoStep();
        })
    }

  }

  /**
 * Quando si seleziona i file
 * @param event
 */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFilesStep2 = Array.from(input.files);
      this.uploadFilesServer();
    }
  }
  /**
   * Reset la selezione dei file quando importato
   */
  private resetFileInput() {
    const fileInput = document.getElementById('fileUpload2') as HTMLInputElement;
    fileInput.value = '';
    this.selectedFilesStep2 = [];
  }

  private uploadFilesServer() {
    // this.imagesStep2 = this.uploadImageService.getImagesStep2();
    const formData = new FormData();
    formData.append("folder", Connect.FOLDER_STEP_TWO);
    formData.append("size", Connect.FILE_SIZE.toString());
    formData.append("size_string", Connect.FILE_SIZE_STRING);
    formData.append("idsystem", this.idsystem.toString());
    formData.append("step_position", "2");
    if (this.selectedFilesStep2 && this.selectedFilesStep2.length + this.imagesStep2.length <= this.maxImagesStep2) {
      this.selectedFilesStep2.forEach((file, index) => {
        formData.append(`files[]`, file);
      });
      this.setImages(formData);
      this.imageSpaceLeftStep2 = true;
    }
    else {
      this.imageSpaceLeftStep2 = false;
    }
  }

  getImages() {
    this.connectServerService.getRequest<ApiResponse<{ listFiles: Image[] }>>(Connect.urlServerLaraApi, 'system/filesList',
      {
        idsystem: this.idsystem,
        step_position: 2
      })
      .subscribe((val: ApiResponse<{ listFiles: Image[] }>) => {
        if (val.data.listFiles) {
          this.imagesStep2 = val.data.listFiles;
        }
      })
  }

  setImages(formData: FormData) {
    this.connectServerService.postRequest<ApiResponse<null>>(Connect.urlServerLaraApi, 'system/uploadFiles',
      formData)
      .subscribe((val: ApiResponse<null>) => {
        this.popupDialogService.alertElement(val);
        this.resetFileInput();
        this.getImages();
      })
  }

  deleteImg(idimage: number) {
    this.connectServerService.postRequest<ApiResponse<null>>(Connect.urlServerLaraApi, 'system/deleteFile',
      { idsystem: this.idsystem, idimage: idimage })
      .subscribe((val: ApiResponse<null>) => {
        this.popupDialogService.alertElement(val);
        this.getImages();
      })
  }
}