import {Component, Input } from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  @Input({ required: true })
  title!: string;

  @Input()
  subtitle = '';

}
