import { Component, OnInit, HostListener } from '@angular/core';
import { AppService } from './app.service';
import { ElectronService } from 'ngx-electron';
import { timeout, catchError } from 'rxjs/operators';
// import { ipcRenderer } from 'electron'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private relay: Number = 0;
  private mode: Number = 0;
  private deviceFound: Boolean = true;

  constructor(private service: AppService, private electronService: ElectronService) { }

  @HostListener('document:keydown.space')
  changeRelay() {
    this.relay === 0 ? this.relay = 1 : this.relay = 0;
    console.log('Relay: ' + this.relay);
  }

  @HostListener('document:keydown.1')
  changeMode() {
    this.mode === 0 ? this.mode = 1 : this.mode = 0;
    console.log('Mode: ' + this.mode);
  }

  @HostListener('document:keydown.R')
  checkTmp() {
    console.log('here');
    this.checkDeviceAvailability();
  }

  ngOnInit() {
    console.log('onInit');
    // this.checkDeviceAvailability();

    this.service.getDeviceStatus()
    .pipe(
      timeout(2000)
    )
    .subscribe(
      resp => {
        // console.log(resp);
        // this.deviceFound = true;
      },
      err => {
        // console.error(err);
        // this.deviceFound = false;
        console.log("err here");
        this.electronService.ipcRenderer.send('get-data', 'ping');
        this.electronService.ipcRenderer.on('reply-data', (event, arg) => {
          console.log(arg);
        });
      });

    // if(!this.deviceFound) {
      
    // }

    //TODO move to some trigger and check if switchboxd responds
    // this.electronService.ipcRenderer.send('get-data', 'ping');
    // this.electronService.ipcRenderer.on('reply-data', (event, arg) => {
    //   console.log(arg);
    // });

  }

  checkDeviceAvailability() {
    this.service.getDeviceStatus()
      .pipe(
        timeout(2000)
      )
      .subscribe(
        resp => {
          console.log(resp);
          this.deviceFound = true;
        },
        err => {
          console.error(err);
          this.deviceFound = false;
        });
  }

  toggleSwitch() {
    this.service.setRelayState(this.relay, 2).subscribe(resp => {
      console.log(resp);
    });
  }

}
