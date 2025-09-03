import { SocketService } from '../services/socket';
import { UIController } from '../services/ui';
import { AppController } from '../client';
import { EVENTS } from '../../types/events';

/**
 * Associa os eventos do DOM aos seus respetivos handlers para a vista de anfitrião.
 */
export function bindHostDOMEvents() {
  UIController.elements.revealBtn.addEventListener('click', () =>
    SocketService.emit(EVENTS.REVEAL_RESPONSES)
  );

  UIController.elements.clearBtn.addEventListener('click', () =>
    SocketService.emit(EVENTS.CLEAR_RESPONSES)
  );

  UIController.elements.showInfoBtn.addEventListener('click', () =>
    UIController.mostrarPainelInfo()
  );

  UIController.elements.closeInfoBtn.addEventListener('click', () =>
    UIController.esconderPainelInfo()
  );

  UIController.elements.infoPanel.addEventListener('click', (e) => {
    if (e.target === UIController.elements.infoPanel) {
      UIController.esconderPainelInfo();
    }
  });

  UIController.elements.toggleLiveBtn.addEventListener('click', () => {
    AppController.isLiveMode = !AppController.isLiveMode;
    UIController.setLiveMode(AppController.isLiveMode);
    if (AppController.isLiveMode) {
      UIController.mostrarRespostasReveladas(AppController.respostasLive);
    } else {
      // No modo não-live, mostra as respostas reveladas (ou um contentor vazio se ainda não foram)
      const {
        respostasReveladas,
      } = require('../client'); // Importação tardia para evitar ciclo
      UIController.mostrarRespostasReveladas(respostasReveladas);
    }
  });
}
