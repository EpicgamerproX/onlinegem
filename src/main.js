import { Game } from './core/Game.js';
import { AuthManager } from './services/AuthManager.js';

const authManager = new AuthManager();

authManager
  .init()
  .then(async authContext => {
    const game = new Game();
    await game.start(authContext);
  })
  .catch(error => {
    console.error('Unable to start OnlineGem:', error);
  });
