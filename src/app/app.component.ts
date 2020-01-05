import { Component, OnInit, HostListener } from '@angular/core';
import { AppService } from './app.service';
import { ElectronService } from 'ngx-electron';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private relay: Number = 0;
  private mode: Number = 0;
  private inputIp: String;

  constructor(private service: AppService, private electronService: ElectronService) { }

  @HostListener('document:keydown.space')
  changeRelay() {
    this.relay === 0 ? this.relay = 1 : this.relay = 0;
    console.log('Relay: ' + this.relay);
  }

  @HostListener('document:keydown.Z')
  changeMode() {
    this.mode === 0 ? this.mode = 1 : this.mode = 0;
    console.log('Mode: ' + this.mode);
  }

  @HostListener('document:keydown.X')
  askForIp() {
    this.mode === 2 ? this.mode = 0 : this.mode = 2;
    console.log('Mode: ' + this.mode);
  }

  ngOnInit() {
    this.service.getDeviceStatus()
    .pipe(
      timeout(2000)
    )
    .subscribe(
      resp => {},
      err => {
        this.electronService.ipcRenderer.send('get-stored-ip', 'ping');
        this.electronService.ipcRenderer.on('reply-stored-ip', (event, arg) => {
          console.log("reply-stored-ip");
          console.log(arg);

          this.service.setIp(arg);
          this.service.getDeviceStatus()
          .pipe(
            timeout(2000)
          )
          .subscribe(
            resp => {},
            err => {
              this.electronService.ipcRenderer.send('get-data', 'ping');
              this.electronService.ipcRenderer.on('reply-data', (event, arg) => {
                console.log("reply-data");
                console.log(arg);

                this.service.setIp(arg);
              });
            });
          });
      
      });
  }

  toggleSwitch() {
    this.service.setRelayState(this.relay, 2).subscribe(resp => {
      console.log(resp);
    });
  }

  submitIp() {
    console.log('from submitIp');
    console.log(this.inputIp);

    this.service.setIp(this.inputIp);
    this.electronService.ipcRenderer.send('send-input-ip', this.inputIp);

    this.mode = 0;
  }

}
