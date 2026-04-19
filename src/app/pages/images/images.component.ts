import { Component, AfterViewInit } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';
import { IInputInterface, ISquareBtnInterface, IUploadInterface } from 'src/app/interfaces/_interfaces';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss']
})
export class ImagesComponent implements AfterViewInit {
  get inputWidthObj(): IInputInterface {
    return {
      label: "Largura",
      type: "number",
      id: "resizeWidth",
      action: () => this.resizeImage(),
      disabled: !this.imageLoaded
    }
  }
  
  get inputHeightObj(): IInputInterface {
    return {
      label: "Altura",
      type: "number",
      id: "resizeHeight",
      action: () => this.resizeImage(),
      disabled: !this.imageLoaded
    }
  }
  
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
    {
      label: "Desfazer",
      action: () => this.undo(),
      icon: {
        name: "Undo",
      }
    },
    {
      label: "Refazer",
      action: () => this.redo(),
      icon: {
        name: "Redo",
      }
    },
    {
      label: "Remover/Alterar imagem",
      action: () => this.removeImage(),
      icon: {
        name: "x",
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
  history: string[] = [];
  historyIndex = -1;
  maxHistoryStates = 20;
  showUpload = true;
  imageLoaded = false; // Controla se uma imagem foi carregada
  showDownloadMenu = false;
  initialCanvasWidth: number = 0;
  initialCanvasHeight: number = 0;

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

    // Armazenar as dimensões iniciais do canvas (antes de qualquer imagem ser carregada)
    this.initialCanvasWidth = this.canvas.width;
    this.initialCanvasHeight = this.canvas.height;

    // Inicializa o estado dos botões
    this.updateButtonStates();

    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.addEventListener('change', (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.img.onload = () => {
          const { width, height } = this.scaleImageToFit(this.img.width, this.img.height);
          this.canvas.width = width;
          this.canvas.height = height;
          this.originalAspectRatio = width / height;
          if (this.ctx) {
            // Cria um canvas temporário para redimensionar a imagem
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              // Usa os 9 parâmetros para redimensionar a imagem completa
              tempCtx.drawImage(this.img, 0, 0, this.img.width, this.img.height, 0, 0, width, height);
              this.ctx.drawImage(tempCanvas, 0, 0);
            }
          }
          this.updateResizeInputs();
          this.selection = null;
          this.history = [];
          this.historyIndex = -1;
          this.showUpload = false;
          this.imageLoaded = true;
          this.saveState();
          this.draw();
          this.updateButtonStates();
        };
        this.img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.selectionEnabled) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.canvas.width / this.canvas.clientWidth);
      const y = (e.clientY - rect.top) * (this.canvas.height / this.canvas.clientHeight);

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
      if (!this.selectionEnabled && !this.isSelecting && !this.dragging && !this.resizing) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.canvas.width / this.canvas.clientWidth);
      const y = (e.clientY - rect.top) * (this.canvas.height / this.canvas.clientHeight);

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
      if (this.keepAspect) {
        this.resizeHeightInput.value = Math.round(
          parseInt(this.resizeWidthInput.value) / this.originalAspectRatio
        ).toString();
      }
    });

    this.resizeHeightInput.addEventListener('input', () => {
      if (this.keepAspect) {
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
          const { width, height } = this.scaleImageToFit(this.img.width, this.img.height);
          this.canvas.width = width;
          this.canvas.height = height;
          this.originalAspectRatio = width / height;
          if (this.ctx) {
            // Cria um canvas temporário para redimensionar a imagem
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              // Usa os 9 parâmetros para redimensionar a imagem completa
              tempCtx.drawImage(this.img, 0, 0, this.img.width, this.img.height, 0, 0, width, height);
              this.ctx.drawImage(tempCanvas, 0, 0);
            }
          }
          this.updateResizeInputs();
          this.selection = null;
          this.history = [];
          this.historyIndex = -1;
          this.showUpload = false;
          this.imageLoaded = true;
          this.saveState();
          this.draw();
          this.updateButtonStates();
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

    // Desenha apenas a imagem sem seleção antes de fazer o corte
    this.drawImageOnly();
    
    // Agora pega os dados da imagem limpa (sem as linhas)
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
      this.saveState();
      this.updateButtonStates();
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
    tctx?.drawImage(this.img, 0, 0, width, height);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx?.drawImage(tempCanvas, 0, 0, width, height);

    this.img.src = this.canvas.toDataURL();
    this.img.onload = () => {
      this.saveState();
      this.updateButtonStates();
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
    this.img.onload = () => {
      this.saveState();
      this.updateButtonStates();
      this.draw();
    };
  }

  updateResizeInputs() {
    this.resizeWidthInput.value = this.canvas.width.toString();
    this.resizeHeightInput.value = this.canvas.height.toString();
  }

  draw() {
    this?.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Desenha a imagem redimensionada para caber no canvas
    this?.ctx?.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);

    if (this.selectionEnabled && this.selection && this.ctx) {
      this.ctx.strokeStyle = '#cccccc'; // Cinza claro
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]); // Linhas tracejadas
      this.ctx.strokeRect(this.selection.x, this.selection.y, this.selection.width, this.selection.height);
      this.ctx.setLineDash([]); // Remove o padrão tracejado
      this.ctx.fillStyle = 'rgba(200, 200, 200, 0.4)'; // Cinza translúcido
      this.ctx.fillRect(this.selection.x, this.selection.y, this.selection.width, this.selection.height);
      this.ctx.fillStyle = 'blue';
      this.ctx.fillRect(
        this.selection.x + this.selection.width - this.resizeHandleSize / 2,
        this.selection.y + this.selection.height - this.resizeHandleSize / 2,
        this.resizeHandleSize,
        this.resizeHandleSize
      );
    }
  }

  // Desenha apenas a imagem sem as linhas de seleção (para salvar no histórico)
  drawImageOnly() {
    this?.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Desenha apenas a imagem sem seleção
    this?.ctx?.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
  }

  downloadImage(format: string) {
    const link = document.createElement('a');
    link.download = `imagem.${format.split('/')[1]}`;
    link.href = this.canvas.toDataURL(format);
    link.click();
  }

  onFormatChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const format = select.value;
    if (format) {
      this.downloadImage(format);
      // Reseta o select
      select.value = '';
    }
  }

  toggleDownloadMenu() {
    this.showDownloadMenu = !this.showDownloadMenu;
  }

  saveState() {
    // Desenha apenas a imagem sem as linhas de seleção antes de salvar
    this.drawImageOnly();
    
    // Remove qualquer histórico futuro se estamos no meio do histórico
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Adiciona o novo estado
    this.history.push(this.canvas.toDataURL());
    this.historyIndex++;
    
    // Limita o número de estados no histórico
    if (this.history.length > this.maxHistoryStates) {
      this.history.shift();
      this.historyIndex--;
    }
    
    // Redesenha com a seleção se houver
    this.draw();
  }

  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  getMaxCanvasDimensions(): { width: number; height: number } {
    // Calcula as dimensões máximas disponíveis
    const maxWidth = window.innerWidth - 700; // Espaço para a toolbar
    const maxHeight = window.innerHeight - 200; // Espaço para header e ferramentas
    
    return {
      width: Math.max(340, Math.min(maxWidth, 1920)), // Min 340px, Max 1920px
      height: Math.max(340, maxHeight)
    };
  }

  scaleImageToFit(imgWidth: number, imgHeight: number): { width: number; height: number } {
    const { width: maxWidth, height: maxHeight } = this.getMaxCanvasDimensions();
    
    let width = imgWidth;
    let height = imgHeight;
    const aspectRatio = imgWidth / imgHeight;
    
    // Se a imagem é maior que o máximo disponível, redimensiona mantendo proporção
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  updateButtonStates() {
    // Desabilita todos os botões se não houver imagem
    if (!this.imageLoaded) {
      this.toolsButtons.forEach(btn => btn.disabled = true);
      return;
    }

    // Ativa os primeiros 4 botões (flip H, flip V, crop, apply crop)
    this.toolsButtons[0].disabled = false;
    this.toolsButtons[1].disabled = false;
    this.toolsButtons[2].disabled = false;
    this.toolsButtons[3].disabled = false;

    // Controla undo/redo
    this.toolsButtons[4].disabled = !this.canUndo();
    this.toolsButtons[5].disabled = !this.canRedo();
    
    // Botão de remover imagem sempre ativo quando há imagem
    this.toolsButtons[6].disabled = false;
  }

  undo() {
    if (this.canUndo()) {
      this.historyIndex--;
      this.restoreState();
    }
  }

  redo() {
    if (this.canRedo()) {
      this.historyIndex++;
      this.restoreState();
    }
  }

  restoreState() {
    const imageData = this.history[this.historyIndex];
    this.img.onload = () => {
      this.canvas.width = this.img.width;
      this.canvas.height = this.img.height;
      this.ctx?.drawImage(this.img, 0, 0);
      this.originalAspectRatio = this.img.width / this.img.height;
      this.updateResizeInputs();
      this.selection = null;
      this.selectionEnabled = false;
      this.updateButtonStates();
      this.draw();
    };
    this.img.src = imageData;
  }

  removeImage() {
    // Restaurar para o tamanho inicial
    this.canvas.width = this.initialCanvasWidth;
    this.canvas.height = this.initialCanvasHeight;
    
    // Limpar canvas
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Resetar variáveis
    this.img = new Image();
    this.selection = null;
    this.isSelecting = false;
    this.selectionEnabled = false;
    this.dragging = false;
    this.resizing = false;
    
    // Limpar histórico
    this.history = [];
    this.historyIndex = -1;
    
    // Mostrar upload novamente
    this.showUpload = true;
    this.imageLoaded = false;
    
    // Resetar dimensões dos inputs
    this.resizeWidthInput.value = '';
    this.resizeHeightInput.value = '';
    
    // Limpar o arquivo do input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Atualizar estado dos botões
    this.updateButtonStates();
  }
}
