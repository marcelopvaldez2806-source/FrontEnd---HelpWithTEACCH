
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemKabc, SerieKabc } from '../ejercicio-01/ejercicio-01';

export interface RespuestaEjercicio16 {
  valor: string;
}

interface Juguete {
  id: string;
  nombre: string;
  figura: 'cuadrado' | 'circulo' | 'estrella' | 'triangulo' | 'pelota';
  color: string;
}

interface ConfiguracionSerie {
  instruccion: string;
  juguetes: Juguete[];
  solicitados: string[];
}

@Component({
  selector: 'app-ejercicio-16',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ejercicio-16.html',
  styleUrl: './ejercicio-16.css'
})
export class Ejercicio16 implements OnChanges {

  @Input() item!: ItemKabc;
  @Input() serie!: SerieKabc;
  @Input() numeroSerie = 1;
  @Input() totalSeries = 3;
  @Input() enviando = false;

  @Output() respuesta = new EventEmitter<RespuestaEjercicio16>();

  readonly configuraciones: Record<number, ConfiguracionSerie> = {
    1: {
      instruccion: 'Saca el cuadrado azul de la caja y colócalo sobre la mesa.',
      juguetes: [
        { id: 'cuadrado_azul', nombre: 'Cuadrado azul', figura: 'cuadrado', color: '#3986DB' },
        { id: 'estrella_amarilla', nombre: 'Estrella amarilla', figura: 'estrella', color: '#E7B83F' },
        { id: 'pelota_roja', nombre: 'Pelota roja', figura: 'pelota', color: '#D65353' }
      ],
      solicitados: ['cuadrado_azul']
    },
    2: {
      instruccion: 'Saca la estrella amarilla y la pelota roja de la caja y colócalas sobre la mesa.',
      juguetes: [
        { id: 'estrella_amarilla', nombre: 'Estrella amarilla', figura: 'estrella', color: '#E7B83F' },
        { id: 'pelota_roja', nombre: 'Pelota roja', figura: 'pelota', color: '#D65353' },
        { id: 'cuadrado_verde', nombre: 'Cuadrado verde', figura: 'cuadrado', color: '#48A878' }
      ],
      solicitados: ['estrella_amarilla', 'pelota_roja']
    },
    3: {
      instruccion: 'Saca el círculo rojo, el cuadrado azul y la estrella amarilla de la caja y colócalos sobre la mesa.',
      juguetes: [
        { id: 'circulo_rojo', nombre: 'Círculo rojo', figura: 'circulo', color: '#D65353' },
        { id: 'cuadrado_azul', nombre: 'Cuadrado azul', figura: 'cuadrado', color: '#3986DB' },
        { id: 'estrella_amarilla', nombre: 'Estrella amarilla', figura: 'estrella', color: '#E7B83F' },
        { id: 'triangulo_verde', nombre: 'Triángulo verde', figura: 'triangulo', color: '#48A878' }
      ],
      solicitados: ['circulo_rojo', 'cuadrado_azul', 'estrella_amarilla']
    }
  };

  juguetesEnCaja: Juguete[] = [];
  juguetesEnMesa: Juguete[] = [];

  private jugueteArrastrado: string | null = null;
  private touchActivo = false;

  get configuracionActual(): ConfiguracionSerie {
    return this.configuraciones[this.numeroSerie] ?? this.configuraciones[1];
  }

  get puedeFinalizar(): boolean {
    return !this.enviando && this.juguetesEnMesa.length > 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['numeroSerie']) {
      this.reiniciarSerie();
    }
  }

  reiniciarSerie(): void {
    this.juguetesEnCaja = [...this.configuracionActual.juguetes];
    this.juguetesEnMesa = [];
    this.jugueteArrastrado = null;
  }

  // Drag and Drop para mouse
  iniciarArrastre(event: DragEvent, juguete: Juguete): void {
    if (this.enviando) {
      event.preventDefault();
      return;
    }

    this.jugueteArrastrado = juguete.id;

    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', juguete.id);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  permitirSoltar(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  soltarEnMesa(event: DragEvent): void {
    event.preventDefault();

    const id = event.dataTransfer?.getData('text/plain')
      || this.jugueteArrastrado;

    if (id) {
      this.moverAMesa(id);
    }

    this.jugueteArrastrado = null;
  }

  // Compatibilidad con pantallas táctiles
  iniciarToque(event: TouchEvent, juguete: Juguete): void {
    if (this.enviando) return;

    event.preventDefault();
    this.jugueteArrastrado = juguete.id;
    this.touchActivo = true;
  }

  finalizarToque(event: TouchEvent): void {
    if (!this.touchActivo || !this.jugueteArrastrado) return;

    const touch = event.changedTouches[0];
    const elemento = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );

    if (elemento?.closest('.mesa-drop-zone')) {
      this.moverAMesa(this.jugueteArrastrado);
    }

    this.jugueteArrastrado = null;
    this.touchActivo = false;
  }

  moverAMesa(id: string): void {
    if (this.enviando) return;

    const indice = this.juguetesEnCaja.findIndex(j => j.id === id);

    if (indice === -1) return;

    const [juguete] = this.juguetesEnCaja.splice(indice, 1);
    this.juguetesEnMesa = [...this.juguetesEnMesa, juguete];
    this.juguetesEnCaja = [...this.juguetesEnCaja];
  }

  devolverACaja(id: string): void {
    if (this.enviando) return;

    const indice = this.juguetesEnMesa.findIndex(j => j.id === id);

    if (indice === -1) return;

    const [juguete] = this.juguetesEnMesa.splice(indice, 1);
    this.juguetesEnCaja = [...this.juguetesEnCaja, juguete];
    this.juguetesEnMesa = [...this.juguetesEnMesa];
  }

  finalizarEjercicio(): void {
    if (!this.puedeFinalizar) return;

    const idsEnMesa = this.juguetesEnMesa.map(j => j.id);
    const idsEsperados = this.configuracionActual.solicitados;

    const correcto =
      idsEnMesa.length === idsEsperados.length &&
      idsEsperados.every(id => idsEnMesa.includes(id));

    const valorEsperado = String(
      (this.serie as any)?.expectedAnswer ?? ''
    );

    this.respuesta.emit({
      valor: correcto
        ? valorEsperado
        : '__RESPUESTA_INCORRECTA__'
    });
  }
}
