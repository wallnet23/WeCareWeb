import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
//import { SystemInfo } from '../interfaces/full-system-interface';
import { UploadImageService } from '../../../services/upload-images.service';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../../interfaces/api-response';
import { Connect } from '../../../classes/connect';
import { ConnectServerService } from '../../../services/connect-server.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Ticket } from '../interfaces/ticket';
import { Image } from '../../systems/components/interfaces/image';

@Component({
  selector: 'app-ticket-new',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TranslateModule
  ],
  templateUrl: './ticket-new.component.html',
  styleUrl: './ticket-new.component.scss'
})
export class TicketNewComponent {

  selectedFiles: File[] = [];
  maxImages: number = 6;
  imageSpaceLeft: boolean = true;
  images: Image[] = [];
  systems: {id: number, title: string}[] = [];

  ticketForm = new FormGroup({
    id: new FormControl<number>(0, Validators.required),
    date_ticket: new FormControl<string>(this.formatDate(new Date()), Validators.required),
    idsystem: new FormControl<number | null>(null),
    title: new FormControl<string | null>(null, Validators.required),
    description: new FormControl<string | null>(null, Validators.required),
    attachments: new FormControl<string[] | null>(null)
  })

  constructor( public uploadImageService: UploadImageService,
    private connectServerService: ConnectServerService, private router: Router, private activatedRoute: ActivatedRoute) {
      this.activatedRoute.paramMap.subscribe((paramMap) => {
        this.setSystem(parseInt(paramMap.get('id')!));
      });
  }

  private setSystem(idsystem: number) {
    this.connectServerService.getRequest<ApiResponse<{systemInfo: {id: number, title: string}}>>(Connect.urlServerLaraApi, 'system/systemInfo',
      {id: idsystem})
      .subscribe((val: ApiResponse<{systemInfo: {id: number, title: string}}>) => {
        if(val.data) {
          this.systems.push(val.data.systemInfo);
          this.ticketForm.get('idsystem')?.setValue(val.data.systemInfo.id);
          console.log("id", val.data.systemInfo.id)
          console.log("system", this.systems)
        }
      })
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onFileSelected(event: any) {
    const uploadCallback = () => {
      this.images = this.uploadImageService.getImages();
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
      }
    }
    const files: FileList = event.target.files;
    if (files.length > 0) {
      this.imageSpaceLeft = this.uploadImageService.upload(files, uploadCallback, this.maxImages);
    }
  }

  deleteImg(index: number) {
    const deleteCallback = () => {
      this.images = this.uploadImageService.getImages();
    }
    this.uploadImageService.deleteImg(index, deleteCallback);
  }

  submitTicket() {
    let ticket: Ticket;
    ticket = {
      id: this.ticketForm.get('id')?.value!,
      date_ticket: this.ticketForm.get('date_ticket')?.value!,
      idsystem: this.ticketForm.get('idsystem')?.value!,
      title: this.ticketForm.get('title')?.value!,
      description: this.ticketForm.get('description')?.value!,
    }
    let attachments = this.ticketForm.get('attachments')?.value!

    const formData = new FormData();
    formData.append('ticket', JSON.stringify(ticket));
    if (this.selectedFiles) {
      console.log("Immagini presenti")
      this.selectedFiles.forEach((file, index) => {
        formData.append(`files[]`, file);
      });
    }

    this.connectServerService.postRequest<ApiResponse<Ticket>>(Connect.urlServerLaraApi, 'ticket/insertTicket',
      formData).
      subscribe((val: ApiResponse<Ticket>) => {
        if(val.data) {
          this.router.navigate(['/ticket', val.data.id]);
        }
      })
  }

}