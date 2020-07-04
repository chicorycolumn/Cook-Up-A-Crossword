import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { SocketioService } from '../services/socketio.service';
import * as Util from '../shared/utils';

let DEV_deactivateSocket = 0; // dev switch
let DEV_onlyShowResultBox = 0; // dev switch
let DEV_padWithExampleResults = 0; // dev switch
let DEV_timeOfBuild = 1532; // dev note

@Component({
  selector: 'app-make',
  templateUrl: './make.component.html',
  styleUrls: ['./make.component.css'],
})
export class MakeComponent implements OnInit {
  slidesData = [
    {
      id: 's0',
      class: 'carouselItemA',
      src: '../../assets/Crossword 5x5.png',
      value: '5x5',
      text: 'Six 5-letter words',
      checked: true,
    },
    {
      id: 's1',
      class: 'carouselItemB',
      src: '../../assets/Crossword 7x5.png',
      value: '7x5',
      text: 'Three 7-letter words\nFour 5-letter words',
      checked: false,
    },
    {
      id: 's2',
      class: 'carouselItemC',
      src: '../../assets/Crossword 7x7.png',
      value: '7x7',
      text: 'Eight 7-letter words',
      checked: false,
    },
    {
      id: 's3',
      class: 'carouselItemOffRight',
      src: '../../assets/Crossword 9x5.png',
      value: '9x5',
      text: 'Three 9-letter words\nFive 5-letter words',
      checked: false,
    },

    {
      id: 's4',
      class: 'carouselItemHidden',
      src: '../../assets/Crossword 9x7.png',
      value: '9x7',
      text: 'Four 9-letter words\nFive 7-letter words',
      checked: false,
    },
    {
      id: 's5',
      class: 'carouselItemOffLeft',
      src: '../../assets/Crossword 9x9.png',
      value: '9x9',
      text: 'Eight 9-letter words',
      checked: false,
    },
  ];

  devButtonsShowing = { value: false };
  DEV_onlyShowResultBox = DEV_onlyShowResultBox;
  DEV_deactivateSocket = DEV_deactivateSocket;
  DEV_timeOfBuild = DEV_timeOfBuild;
  startButtonActive = { value: false };
  DEV_socketUsingLocal = { value: false };
  DEV_hard9x5 = { value: false };
  serverIsIndeedWorking = { value: false };
  desiPlaceholderText = 'eg spoke azure';
  gridLayout = 'two rows';
  results = {
    index: 0,
    array: DEV_padWithExampleResults ? Util.resultsArray : [],
  };
  socketIsReady = { value: false };
  helpDisplay = Util.helpDisplay;

  makeCrosswordForm = this.fb.group({
    shape: this.fb.group({
      shapeName: '5x5',
    }),
    mand: [''],
    bann: [''],
    desi: [''],
    desiSeparator: [' '],
    threshold: [''],
  });

  constructor(
    private fb: FormBuilder,
    private socketService: SocketioService
  ) {}

  ngOnInit(): void {
    this.startButtonActive.value = false; //delete?
    this.serverIsIndeedWorking.value = false; //delete?

    setTimeout(this.checkIfFlexWrap, 0);
    if (!DEV_deactivateSocket) {
      this.socketService.setupSocketConnection(
        true,
        this.startButtonActive,
        this.serverIsIndeedWorking,
        this.results,
        this.socketIsReady
      );
    }
  }

  rotateCarousel(direction) {
    Util.rotateCarouselArray(this.slidesData, direction);
  }

  slideToElement(id) {
    setTimeout(() => {
      const yOffset = -75;
      const element = document.getElementById(id);
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }, 100);
  }

  checkShapeRadio(id) {
    this.slidesData.forEach((slideData) => {
      if (slideData.id === id) {
        slideData.checked = true;
      } else {
        slideData.checked = false;
      }
    });
  }

  setHard5x9() {
    this.DEV_hard9x5.value = true;
  }

  exitErrorBubble(key) {
    this.helpDisplay[key].show = false;
    // this.helpDisplay.current = null;
  }

  devEvent() {
    this.socketService.verifyOff();
  }

  plusSlides(direction) {}

  devEvent2() {
    this.socketService.stop('Client used dev button to request disconnect.');
  }

  socketToLocalHost() {
    if (!DEV_deactivateSocket) {
      this.socketService.setupSocketConnection(
        false,
        this.startButtonActive,
        this.serverIsIndeedWorking,
        this.results,
        this.socketIsReady
      );
      this.DEV_socketUsingLocal.value = true;
    }
  }

  updateDesiPlaceholderText(sepName) {
    const ref = {
      space: 'eg spoke azure',
      marks: 'eg "SPOKE" part of a wheel. "azure" - Shade of blue.',
    };
    this.desiPlaceholderText = ref[sepName];
  }

  clickToDownload() {
    let border = '------------------------';
    let resultsTxt =
      "Thank you for using Crossword Crocodile!\n\n           .-._   _ _ _ _ _ _ _ _\n.-''-.__.-'00  '-' ' ' ' ' ' ' ' '-.\n'.___ '    .   .--_'-' '-' '-' _'-' '._\n V: V 'vv-'   '_   '.       .'  _..' '.'.\n   '=.____.=_.--'   :_.__.__:_   '.   : :\n           (((____.-'        '-.  /   : :\n                               (((-' .' /\n                            _____..'  .'\nart by Shanaka Dias        '-._____.-'\n\n\n" +
      border +
      '\n';
    let gridTxt = '';
    let summaryTxt = '';

    this.results.array.forEach((resObj) => {
      resObj['summary'].forEach((summaryLine) => {
        summaryTxt += '\n' + summaryLine;
      });
      resObj['grid'].forEach((gridLine) => {
        let arr = (<string>gridLine[0]).split(/(\d+)/);
        let num = arr[1];
        let word = arr[2].toLowerCase();
        const ref = { ac: 'Across', do: 'Down' };
        let formattedCoord = `${num} ${ref[word]}`;
        let wordsToFormat = gridLine.slice(1);
        let formattedWords =
          typeof wordsToFormat[0] === 'string'
            ? wordsToFormat[0]
            : (<string[]>wordsToFormat[0]).join(', ');
        gridTxt +=
          '\n' +
          formattedCoord +
          (/a/i.test(formattedCoord) ? ':  ' : ':    ') +
          formattedWords;
      });
      resultsTxt += summaryTxt + '\n' + gridTxt + '\n\n' + border + '\n';
      gridTxt = '';
      summaryTxt = '';
    });

    let myblob = new Blob([resultsTxt], {
      type: 'text/plain',
    });

    const url = URL.createObjectURL(myblob);
    const link = document.createElement('a');
    link.download = `Grid-Results-${Date.now()}.txt`;
    link.href = url;
    link.click();
  }
  clickToReport() {
    window.open(
      'mailto:c.matus.contact@gmail.com?subject=Crossword Feedback',
      '_blank'
    );
  }

  changeResultsIndex(direction) {
    if (direction === 'up' && this.results.index > 0) {
      this.results.index--;
    } else if (
      direction === 'down' &&
      this.results.index < this.results.array.length - 1
    ) {
      this.results.index++;
    }
  }

  failedValidation(code, helpDisplay, slideToElement) {
    helpDisplay[code].show = true;
    helpDisplay.current = code;
    slideToElement(helpDisplay[code].id);
  }

  socketStop() {
    console.log(
      'MCT STOP says serverIsIndeedWorking.value is',
      this.serverIsIndeedWorking.value,
      'and startButtonActive.value is',
      this.startButtonActive.value
    );

    let timestamp = Date.now() / 1000;

    !this.DEV_deactivateSocket &&
      this.socketService.stop(`Client clicked STOP button at ${timestamp}`);
    setTimeout(() => {
      this.startButtonActive.value = false;
      this.serverIsIndeedWorking.value = false;
    }, 0);
    setTimeout(() => {
      !this.DEV_deactivateSocket &&
        this.socketService.stop(
          `10ms delayed redundancy-repeat of client clicking STOP button at  at ${timestamp}`
        );
    }, 10);
  }

  showDevButtons() {
    if (this.makeCrosswordForm.value['bann'] === 'ved') {
      this.devButtonsShowing.value = true;
      this.makeCrosswordForm.controls['bann'].setValue('');
    }
  }

  socketEmit() {
    console.log(this.slidesData[0].checked);
    console.log(this.slidesData[1].checked);
    console.log(this.slidesData[2].checked);
    console.log(this.makeCrosswordForm.value.shape);
    return;

    console.log(
      'MCT EMIT says serverIsIndeedWorking.value is',
      this.serverIsIndeedWorking.value,
      'and startButtonActive.value is',
      this.startButtonActive.value
    );

    Util.socketEmit(
      this.helpDisplay,
      this.makeCrosswordForm,
      this.failedValidation,
      this.startButtonActive,
      this.wipeResultState,
      this.socketService,
      this.results,
      this.slideToElement,
      this.DEV_deactivateSocket,
      this.DEV_hard9x5
    );
  }

  wipeResultState(results) {
    let len = results.array.length;
    for (let i = 0; i < len; i++) {
      results.array.pop();
    }
    results.index = 0;
  }

  verifyOff() {
    this.socketService.verifyOff();
  }

  formChanged() {
    console.log('form changed');
    if (this.startButtonActive.value) {
      this.socketStop();
    }
  }

  onResize(e) {
    this.checkIfFlexWrap();
  }

  checkIfFlexWrap() {
    let boxes = {
      box1: document.getElementById('box1'),
      box2: document.getElementById('box2'),
    };

    if (boxes['box1'].offsetTop < boxes['box2'].offsetTop) {
      this.gridLayout = 'one column';
    } else {
      this.gridLayout = 'two rows';
    }
  }
}
