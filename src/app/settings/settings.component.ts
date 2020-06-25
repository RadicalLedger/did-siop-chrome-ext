import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BackgroundMessageService } from '../background-message.service';
import { TASKS } from '../../globals'; 

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  currentDID: string;
  signingInfoSet: any[] = [];
  
  @ViewChild('newDID') newDID: ElementRef;
  @ViewChild('changeDIDModalClose') changeDIDModalClose: ElementRef;
  @ViewChild('changeDIDModalInfo') changeDIDModalInfo: ElementRef;
  @ViewChild('changeDIDModalYes') changeDIDModalYes: ElementRef;

  @ViewChild('addNewKeyButton') addNewKeyButton: ElementRef;
  @ViewChild('addNewKeyModalClose') addNewKeyModalClose: ElementRef;
  @ViewChild('addNewKeyModalYes') addNewKeyModalYes: ElementRef;
  @ViewChild('addNewKeyModalInfo') addNewKeyModalInfo: ElementRef;
  @ViewChild('newKeyString') newKeyString: ElementRef;
  @ViewChild('newKeyKID') newKeyKID: ElementRef;

  @ViewChild('newPasswordModalClose') newPasswordModalClose: ElementRef;
  @ViewChild('newPasswordModalInfo') newPasswordModalInfo: ElementRef;
  @ViewChild('oldPassword') oldPassword: ElementRef;
  @ViewChild('newPassword') newPassword: ElementRef;
  @ViewChild('newPassword2') newPassword2: ElementRef;
  
  @ViewChild('removeKeyModalInfo') removeKeyModalInfo: ElementRef;
  @ViewChild('removeKeyModalClose') removeKeyModalClose: ElementRef;
  @ViewChild('toRemoveKeyKID') toRemoveKeyKID: ElementRef;

  @ViewChild('testDataModalClose') testDataModalClose: ElementRef;
  @ViewChild('testDataModalInfo') testDataModalInfo: ElementRef;
  @ViewChild('testDataModalYes') testDataModalYes: ElementRef;

  @Output() clickedBack = new EventEmitter<boolean>();

  constructor(private changeDetector: ChangeDetectorRef, private toastrService: ToastrService, private messageService: BackgroundMessageService) {
    this.messageService.sendMessage(
      {
        task: TASKS.GET_IDENTITY
      }
      ,
      (response) => {
        if(response.did){
          this.currentDID = response.did;
          this.signingInfoSet = JSON.parse(response.keys);
        }
        else{
          this.currentDID = 'No DID provided';
          this.addNewKeyButton.nativeElement.disabled = true;
        }
        this.changeDetector.detectChanges();
      }
    )
  }

  ngOnInit(): void {
  }

  changeDIDButtonClicked(){
    this.changeDIDModalInfo.nativeElement.innerText = '';
    this.newDID.nativeElement.value = '';
  }

  async changeDID(did: string){
    this.changeDIDModalInfo.nativeElement.classList.remove('error');
    this.changeDIDModalInfo.nativeElement.classList.add('waiting');
    this.changeDIDModalInfo.nativeElement.innerText = 'Please wait';
    this.changeDIDModalClose.nativeElement.disabled = true;
    this.changeDIDModalYes.nativeElement.disabled = true;
    if(did){
      this.messageService.sendMessage({
        task: TASKS.CHANGE_DID,
        did: did,
        }, 
        (response) =>{
          if(response.result){
            this.currentDID = did;
            this.signingInfoSet = [];
            this.newDID.nativeElement.value = '';
            this.changeDIDModalInfo.nativeElement.classList.remove('waiting');
            this.changeDIDModalClose.nativeElement.disabled = false;
            this.changeDIDModalYes.nativeElement.disabled = false;
            this.changeDIDModalClose.nativeElement.click();

            this.addNewKeyButton.nativeElement.disabled = false;
            this.changeDetector.detectChanges();
            this.toastrService.success(response.result, 'DID_SIOP', {
              onActivateTick: true,
              positionClass: 'toast-bottom-center',
            });
          }
          else if(response.err){
            this.changeDIDModalInfo.nativeElement.innerText = response.err;
            this.changeDIDModalInfo.nativeElement.classList.remove('waiting');
            this.changeDIDModalInfo.nativeElement.classList.add('error');
            this.changeDIDModalClose.nativeElement.disabled = false;
            this.changeDIDModalYes.nativeElement.disabled = false;
          }
        }
      );
    }
    else{
      this.changeDIDModalInfo.nativeElement.innerText = 'Please enter a valid DID';
      this.changeDIDModalInfo.nativeElement.classList.remove('waiting');
      this.changeDIDModalInfo.nativeElement.classList.add('error');
      this.changeDIDModalClose.nativeElement.disabled = false;
      this.changeDIDModalYes.nativeElement.disabled = false;
    }
  }

  addNewKeyButtonClicked(){
    this.addNewKeyModalInfo.nativeElement.innerText = '';
    this.newKeyString.nativeElement.value = '';
    this.newKeyKID.nativeElement.value = '';
  }

  async addNewKey(keyString: string, kid: string, format: string, algorithm: string){
    this.addNewKeyModalInfo.nativeElement.classList.remove('error');
    this.addNewKeyModalInfo.nativeElement.classList.add('waiting');
    this.addNewKeyModalInfo.nativeElement.innerText = 'Please wait';
    this.addNewKeyModalClose.nativeElement.disabled = true;
    this.addNewKeyModalYes.nativeElement.disabled = true;

    if(keyString && kid){
      let keyInfo = {
        alg: algorithm,
        kid: kid,
        key: keyString,
        format: format,
      }
  
      this.messageService.sendMessage({
        task: TASKS.ADD_KEY,
        keyInfo: keyInfo,
        }, 
        (response) =>{
          if(response.result){
            this.signingInfoSet.push(keyInfo);
            this.addNewKeyModalInfo.nativeElement.classList.remove('waiting');
            this.addNewKeyModalClose.nativeElement.disabled = false;
            this.addNewKeyModalYes.nativeElement.disabled = false;
            this.addNewKeyModalClose.nativeElement.click();
            this.changeDetector.detectChanges();
            this.toastrService.success(response.result, 'DID_SIOP', {
              onActivateTick: true,
              positionClass: 'toast-bottom-center',
            });
          }
          else if(response.err){
            this.addNewKeyModalInfo.nativeElement.classList.remove('waiting');
            this.addNewKeyModalInfo.nativeElement.classList.add('error');
            this.addNewKeyModalInfo.nativeElement.innerText = response.err;
            this.addNewKeyModalClose.nativeElement.disabled = false;
            this.addNewKeyModalYes.nativeElement.disabled = false;
          }
        }
      );
    }
    else{
      this.addNewKeyModalInfo.nativeElement.classList.remove('waiting');
      this.addNewKeyModalInfo.nativeElement.classList.add('error');
      this.addNewKeyModalInfo.nativeElement.innerText = 'Please fill all fields';
      this.addNewKeyModalClose.nativeElement.disabled = false;
      this.addNewKeyModalYes.nativeElement.disabled = false;
    }
  }

  async removeKey(kid: string){
    this.removeKeyModalInfo.nativeElement.innerText = '';
    if(kid){
      this.messageService.sendMessage({
        task: TASKS.REMOVE_KEY,
        kid: kid,
        }, 
        (response) =>{
          if(response.result){
            this.signingInfoSet = this.signingInfoSet.filter(key => {
              return key.kid !== kid;
            });
            this.toastrService.success(response.result, 'DID_SIOP', {
              onActivateTick: true,
              positionClass: 'toast-bottom-center',
            });
            this.removeKeyModalClose.nativeElement.click();
            this.changeDetector.detectChanges();
          }
          else{
            this.removeKeyModalInfo.nativeElement.innerText = response.err;
          }
        }
      );
    }
  }

  selectKey(keyid){
    this.toRemoveKeyKID.nativeElement.value = keyid;
  }

  async changePassword(oldPassword: string, newPassword: string, newPassword2: string){
    this.newPasswordModalInfo.nativeElement.innerText = '';
    if(oldPassword.length != 0 && newPassword.length != 0 && newPassword2.length != 0){
      if(newPassword === newPassword2){
        this.messageService.sendMessage({
            task: TASKS.LOGIN,
            password: oldPassword
          }, 
          (response)=> {
            if(response.result){
             this.messageService.sendMessage({
               task: TASKS.CHANGE_EXT_AUTHENTICATION,
               oldPassword: oldPassword,
               newPassword: newPassword,
             },
              (response)=> {
                if(response.result){
                  this.oldPassword.nativeElement.value = '';
                  this.newPassword.nativeElement.value = '';
                  this.newPassword2.nativeElement.value = '';
                  this.newPasswordModalClose.nativeElement.click();
                  this.changeDetector.detectChanges();
                  this.toastrService.success('Password changed successfully', 'DID_SIOP', {
                    onActivateTick: true,
                    positionClass: 'toast-bottom-center',
                  });
                }
                else{
                  this.newPasswordModalInfo.nativeElement.innerText = 'An error occurred';
                }
              }
             );
            }
            else{
              this.newPasswordModalInfo.nativeElement.innerText = 'Incorrect old password';
              this.changeDetector.detectChanges();
            }
          }
        );
      }
      else{
        this.newPasswordModalInfo.nativeElement.innerText = 'Passwords do not match';
      }
    }
    else{
      this.newPasswordModalInfo.nativeElement.innerText = 'Please fill all data';
      console.log('error');
    }
  }

  initializeTestDataButtonClicked(){
    this.testDataModalInfo.nativeElement.innerText = '';
  }

  async initializeTestData(){
    this.testDataModalInfo.nativeElement.classList.remove('error');
    this.testDataModalInfo.nativeElement.classList.add('waiting');
    this.testDataModalInfo.nativeElement.innerText = 'Please wait';
    this.testDataModalClose.nativeElement.disabled = true;
    this.testDataModalYes.nativeElement.disabled = true;

    let did = 'did:ethr:0xB07Ead9717b44B6cF439c474362b9B0877CBBF83';
    if(did){
      this.messageService.sendMessage({
        task: TASKS.CHANGE_DID,
        did: did,
        }, 
        (response) =>{
          if(response.result){
            this.currentDID = did;
            this.addNewKeyButton.nativeElement.disabled = false;
            let keyInfo = {
              alg: 'ES256K-R',
              kid: 'did:ethr:0xB07Ead9717b44B6cF439c474362b9B0877CBBF83#owner',
              key: 'CE438802C1F0B6F12BC6E686F372D7D495BC5AA634134B4A7EA4603CB25F0964',
              format: 'HEX',
            }
        
            this.messageService.sendMessage({
              task: TASKS.ADD_KEY,
              keyInfo: keyInfo,
              }, 
              (response) =>{
                if(response.result){
                  this.signingInfoSet = [];
                  this.signingInfoSet.push(keyInfo);
                  this.testDataModalClose.nativeElement.disabled = false;
                  this.testDataModalYes.nativeElement.disabled = false;
                  this.testDataModalClose.nativeElement.click();
                  this.changeDetector.detectChanges();
                  this.toastrService.success('Successful', 'DID_SIOP', {
                    onActivateTick: true,
                    positionClass: 'toast-bottom-center',
                  });
                }
                else if(response.err){
                  this.testDataModalInfo.nativeElement.innerText = response.err;
                  this.testDataModalInfo.nativeElement.classList.remove('waiting');
                  this.testDataModalInfo.nativeElement.classList.add('error');
                  this.testDataModalClose.nativeElement.disabled = false;
                  this.testDataModalYes.nativeElement.disabled = false;
                }
              }
            );
          }
          else if(response.err){
            this.testDataModalInfo.nativeElement.innerText = response.err;
            this.testDataModalInfo.nativeElement.classList.remove('waiting');
            this.testDataModalInfo.nativeElement.classList.add('error');
            this.testDataModalClose.nativeElement.disabled = false;
            this.testDataModalYes.nativeElement.disabled = false;
          }
        }
      );
    }
    else{
      this.changeDIDModalInfo.nativeElement.innerText = 'Please enter a valid DID';
      this.testDataModalInfo.nativeElement.classList.remove('waiting');
      this.testDataModalInfo.nativeElement.classList.add('error');
      this.testDataModalClose.nativeElement.disabled = false;
      this.testDataModalYes.nativeElement.disabled = false;
    }
  }

  goBack(){
    this.clickedBack.emit(true);
  }

}
