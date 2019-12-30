import { Component, OnInit, HostListener } from '@angular/core';
import { AppService } from './app.service';
import { ElectronService } from 'ngx-electron';
// import { ipcRenderer } from 'electron'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private relay: Number = 0;
  private mode: Number = 0;

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

  ngOnInit() {
    //TODO move to some trigger and check if switchboxd responds
    this.electronService.ipcRenderer.send('get-data', 'ping');
    this.electronService.ipcRenderer.on('reply-data', (event, arg) => {
      console.log(arg);
    });

  }

  toggleSwitch() {
    this.service.setRelayState(this.relay, 2).subscribe(resp => {
      console.log(resp);
    });
  }

}
