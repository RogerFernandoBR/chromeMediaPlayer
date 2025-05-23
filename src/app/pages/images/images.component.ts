import { Component, AfterViewInit } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';
import { ISquareBtnInterface, IUploadInterface } from 'src/app/interfaces/_interfaces';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss']
})
export class ImagesComponent implements AfterViewInit {
  toolsButtons: Array<ISquareBtnInterface> = [
    {
      label: "Inverter horizontalmente",
      action: () => this.flipImage(true),
      icon: {
        name: "FlipHorizontal2",
      }
    },
    {
      label: "Inverter verticalmente",
      action: () => this.flipImage(false),
      icon: {
        name: "FlipVertical2",
      }
    },
    {
      label: "Cortar imagem",
      action: () => this.startSelection(),
      icon: {
        name: "scissors",
      }
    },
    {
      label: "Aplicar corte",
      action: () => this.applyCrop(),
      icon: {
        name: "check",
      }
    },
  ]
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D | null;
  resizeWidthInput!: HTMLInputElement;
  resizeHeightInput!: HTMLInputElement;
  keepAspectCheckbox!: HTMLInputElement;
  img = new Image();
  selection: any = null;
  isSelecting = false;
  selectionEnabled = false;
  dragging = false;
  resizing = false;
  dragOffset = { x: 0, y: 0 };
  resizeHandleSize = 10;
  originalAspectRatio = 1;
  keepAspect = true;
  useDarkMode: boolean = true;

  uploadObj: IUploadInterface = {
    text: "Arraste sua midia aqui ou clique para procurar!",
    icon: {
      name: "image-plus",
      size: "90",
      stroke: 0.5
    }
  }

  constructor(private layoutService: LayoutService) {
    this.layoutService.useDarkMode.subscribe((x) => {
      this.useDarkMode = x;
    })
  }

  ngAfterViewInit() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas?.getContext('2d');
    this.resizeWidthInput = document.getElementById('resizeWidth') as HTMLInputElement;
    this.resizeHeightInput = document.getElementById('resizeHeight') as HTMLInputElement;
    this.keepAspectCheckbox = document.getElementById('keepAspect') as HTMLInputElement;

    if (!this.canvas || !this.ctx) {
      console.error('Canvas não encontrado ou contexto inválido');
      return;
    }

    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.addEventListener('change', (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.img.onload = () => {
          this.canvas.width = this.img.width;
          this.canvas.height = this.img.height;
          this.originalAspectRatio = this.img.width / this.img.height;
          if (this.ctx) this.ctx.drawImage(this.img, 0, 0);
          this.updateResizeInputs();
          this.selection = null;
          this.draw();
        };
        this.img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.selectionEnabled) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.selection && this.isOverResizeHandle(x, y)) {
        this.resizing = true;
      } else if (this.selection && this.isInsideSelection(x, y)) {
        this.dragging = true;
        this.dragOffset.x = x - this.selection.x;
        this.dragOffset.y = y - this.selection.y;
      } else {
        this.isSelecting = true;
        this.selection = { x, y, width: 0, height: 0 };
      }
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.selectionEnabled) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.isSelecting && this.selection) {
        this.selection.width = x - this.selection.x;
        this.selection.height = y - this.selection.y;
        this.draw();
      } else if (this.dragging && this.selection) {
        this.selection.x = x - this.dragOffset.x;
        this.selection.y = y - this.dragOffset.y;
        this.draw();
      } else if (this.resizing && this.selection) {
        this.selection.width = x - this.selection.x;
        this.selection.height = y - this.selection.y;
        this.draw();
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isSelecting = false;
      this.dragging = false;
      this.resizing = false;
    });

    this.resizeWidthInput.addEventListener('input', () => {
      if (this.keepAspectCheckbox.checked) {
        this.resizeHeightInput.value = Math.round(
          parseInt(this.resizeWidthInput.value) / this.originalAspectRatio
        ).toString();
      }
    });

    this.resizeHeightInput.addEventListener('input', () => {
      if (this.keepAspectCheckbox.checked) {
        this.resizeWidthInput.value = Math.round(
          parseInt(this.resizeHeightInput.value) * this.originalAspectRatio
        ).toString();
      }
    });
  }

  triggerUpload() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();  // Impede o comportamento padrão (como abrir a imagem no navegador)
    event.stopPropagation();  // Impede que o evento se propague
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer?.files[0]; // Obtém o arquivo arrastado
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvent: any) => {
        this.img.onload = () => {
          this.canvas.width = this.img.width;
          this.canvas.height = this.img.height;
          this.originalAspectRatio = this.img.width / this.img.height;
          if (this.ctx) this.ctx.drawImage(this.img, 0, 0);
          this.updateResizeInputs();
          this.selection = null;
          this.draw();
        };
        this.img.src = loadEvent.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  onButtonClicked() {
    alert("botão clicado")
  }

  startSelection() {
    this.selection = null;
    this.selectionEnabled = true;
    this.draw();
  }

  isInsideSelection(x: number, y: number): boolean {
    return (
      this.selection &&
      x >= this.selection.x &&
      x <= this.selection.x + this.selection.width &&
      y >= this.selection.y &&
      y <= this.selection.y + this.selection.height
    );
  }

  isOverResizeHandle(x: number, y: number): boolean {
    return (
      this.selection &&
      x >= this.selection.x + this.selection.width - this.resizeHandleSize &&
      x <= this.selection.x + this.selection.width + this.resizeHandleSize &&
      y >= this.selection.y + this.selection.height - this.resizeHandleSize &&
      y <= this.selection.y + this.selection.height + this.resizeHandleSize
    );
  }

  applyCrop() {
    if (!this.selection) return;

    let { x, y, width, height } = this.selection;

    if (width < 0) {
      x += width;
      width = Math.abs(width);
    }
    if (height < 0) {
      y += height;
      height = Math.abs(height);
    }

    const imageData = this.ctx?.getImageData(x, y, width, height);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx?.clearRect(0, 0, width, height);
    this.ctx?.putImageData(imageData as ImageData, 0, 0);

    this.img.src = this.canvas.toDataURL();
    this.img.onload = () => {
      this.originalAspectRatio = this.img.width / this.img.height;
      this.updateResizeInputs();
      this.selection = null;
      this.selectionEnabled = false;
      this.draw();
    };
  }

  resizeImage() {
    const width = parseInt(this.resizeWidthInput.value);
    const height = parseInt(this.resizeHeightInput.value);
    if (!width || !height) return;

    const tempCanvas = document.createElement('canvas');
    const tctx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;
    tctx?.drawImage(this.canvas, 0, 0, width, height);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx?.drawImage(tempCanvas, 0, 0);

    this.img.src = this.canvas.toDataURL();
    this.img.onload = () => {
      this.originalAspectRatio = this.img.width / this.img.height;
      this.updateResizeInputs();
      this.draw();
    };
  }

  flipImage(horizontal: boolean) {
    const tempCanvas = document.createElement('canvas');
    const tctx = tempCanvas.getContext('2d');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;

    tctx?.save();
    if (horizontal) {
      tctx?.scale(-1, 1);
      tctx?.drawImage(this.canvas, -this.canvas.width, 0);
    } else {
      tctx?.scale(1, -1);
      tctx?.drawImage(this.canvas, 0, -this.canvas.height);
    }
    tctx?.restore();

    this?.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this?.ctx?.drawImage(tempCanvas, 0, 0);
    this.img.src = this.canvas.toDataURL();
  }

  updateResizeInputs() {
    this.resizeWidthInput.value = this.canvas.width.toString();
    this.resizeHeightInput.value = this.canvas.height.toString();
  }

  draw() {
    this?.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this?.ctx?.drawImage(this.img, 0, 0);

    if (this.selectionEnabled && this.selection && this.ctx) {
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(this.selection.x, this.selection.y, this.selection.width, this.selection.height);
      this.ctx.fillStyle = 'blue';
      this.ctx.fillRect(
        this.selection.x + this.selection.width - this.resizeHandleSize / 2,
        this.selection.y + this.selection.height - this.resizeHandleSize / 2,
        this.resizeHandleSize,
        this.resizeHandleSize
      );
    }
  }

  downloadImage(format: string) {
    const link = document.createElement('a');
    link.download = `imagem.${format.split('/')[1]}`;
    link.href = this.canvas.toDataURL(format);
    link.click();
  }
}
