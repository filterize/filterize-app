import {
    Directive,
    ElementRef,
    HostListener,
    Input,
    OnInit,
    OnDestroy,
    OnChanges,
    SimpleChanges
} from '@angular/core';

@Directive({
    selector: '[mamaMenuExposeWhen]'
})
export class MamaMenuExpose implements OnInit, OnDestroy, OnChanges {
    private element:HTMLElement;
    private observe:boolean;
    @Input('mamaMenuExposeWhen') exposeWhen:number;

    constructor(element:ElementRef) {
        this.element = element.nativeElement;
    }

    ngOnInit() {
        window.innerWidth >= (this.exposeWhen || 1024) && this.initListener();
    }

    ngOnDestroy() {
        this.destroyListener();
    }

    ngOnChanges(changes:SimpleChanges) {
        for (let propName in changes) {
            propName === 'exposeWhen' && window.innerWidth >= (this.exposeWhen || 1024) && this.initListener();
        }
    }

    @HostListener('window:resize', [])
    onWindowResize() {
        if (window.innerWidth >= (this.exposeWhen || 1024)) {
            this.initListener();
        } else {
            this.destroyListener();
        }
    }

    initListener() {
        this.observe = true;

        const observe = () => {
            if (!this.observe) {
                return;
            }

            this.element.getAttribute('style') && this.element.setAttribute('style', '');

            requestAnimationFrame(observe);
        };

        observe();
    }

    destroyListener() {
        this.observe = false;
    }
}
