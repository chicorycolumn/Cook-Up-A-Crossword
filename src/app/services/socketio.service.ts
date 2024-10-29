import { Injectable } from '@angular/core';
import socketIOClient from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketioService {
  socket;
  startButtonActive;
  serverIsIndeedWorking;

  constructor() {}

  timestampOfLatestRequest = 0;
  latestGridSpecs = {};
  millionPermsRecord = { value: 0 };

  setupSocketConnection(
    shouldEndpointBeHeroku,
    startButtonActive,
    serverIsIndeedWorking,
    results,
    socketIsReady,
    disconnectedByServer,
    shrinkTextIfOverflowing,
    transparentResults
  ) {
    this.socket = socketIOClient('http://localhost:5000', {
      transports: ['websocket'],
    });

    this.startButtonActive = startButtonActive;
    this.serverIsIndeedWorking = serverIsIndeedWorking;

    this.socket.on('connect', () => {
      console.log('Connected!', Date.now() / 1000);
    });

    this.socket.on('disconnect', () => {
      if (startButtonActive.value) {
        if (Date.now() < this.timestampOfLatestRequest + 30000) {
          serverIsIndeedWorking.value = false;
          this.emitGridSpecs(this.latestGridSpecs, false, null);
        } else {
          disconnectedByServer.value = true;
          this.turnOffButtons();
          this.stop(
            "A foreign disconnection happened, thus client requests disconnect so we're all on the same page."
          );
        }
      }
    });

    this.socket.on('server sent message', (data) => {
      if (Object.keys(data).includes('million_perms_processed')) {
        this.millionPermsRecord.value = parseFloat(
          data['million_perms_processed']
        );
      }

      console.log('Server sent ', data, Date.now() / 1000);
    });

    this.socket.on('connection confirmed', (data) => {
      console.log('Server connected, and sent ', data, Date.now() / 1000);
      socketIsReady.value = true;
    });

    this.socket.on('started', (data) => {
      if (!startButtonActive.value) {
        this.stop(
          "Client requests disconnect, because startbutton inactive but server had sent a 'started' event."
        );
      } else if (!serverIsIndeedWorking.value) {
        setTimeout(() => {
          serverIsIndeedWorking.value = true;
        }, 100);
      }
    });

    this.socket.on('terminated', (data) => {
      console.log('Server says terminated.', Date.now() / 1000);
      this.turnOffButtons();
    });

    this.socket.on('produced grid', (data) => {
      if (startButtonActive.value) {
        if (!results.array.length) {
          shrinkTextIfOverflowing(transparentResults, results);
        }
        data['result']['margin'] = 1;
        data['result']['marginUnset'] = true;
        results.array.push(data['result']);
      } else {
        this.stop(
          'Client requests disconnect, because startbutton inactive but server had sent a result.'
        );
      }
    });
  }

  turnOffButtons() {
    if (this.startButtonActive.value) {
      this.startButtonActive.value = false;
    }
    if (this.serverIsIndeedWorking.value) {
      this.serverIsIndeedWorking.value = false;
    }
  }

  changeFruit(fruit) {
    this.socket.emit('change fruit', { fruit: fruit });
  }

  checkFruit() {
    this.socket.emit('check fruit', {});
  }

  stop(message) {
    console.log(message, Date.now() / 1000);
    this.socket.emit('please terminate', { message: message });
  }

  emitGridSpecs(data, thisIsFirstTimeRequest, millionPermsRecord) {
    if (thisIsFirstTimeRequest) {
      this.timestampOfLatestRequest = Date.now();
      this.millionPermsRecord = millionPermsRecord;
    }
    this.millionPermsRecord.value = 0;
    this.latestGridSpecs = data;
    this.socket.emit('grid specs', data);
  }

  message() {
    this.socket.emit('client sent message', {
      message: 'I am the client, I am trying to connect to server.',
    });
  }

  verifyOff() {
    this.socket.emit('verify off', {});
  }
}
