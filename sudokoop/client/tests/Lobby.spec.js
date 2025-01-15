import { mount } from '@vue/test-utils';
import Lobby from '@/views/Lobby.vue';
import socket from '@/plugins/socket.js';

jest.mock('@/plugins/socket.js', () => ({
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn()
}));

describe('Lobby.vue', () => {
  let wrapper;
  let routerPushMock;

  beforeEach(() => {
    // Imposta uno username simulato in sessionStorage
    sessionStorage.setItem('username', 'testuser');

    // Crea un mock per $router con push
    routerPushMock = jest.fn();

    // Monta il componente Lobby passando il mock del router
    wrapper = mount(Lobby, {
      global: {
        mocks: {
          $router: { push: routerPushMock }
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('chiama socket.emit con i parametri corretti quando createLobby è invocato', () => {
    wrapper.vm.createLobby();
    expect(socket.emit).toHaveBeenCalledWith('createLobby', 'testuser');
  });

  it('chiama socket.emit con i parametri corretti quando joinLobby è invocato', () => {
    wrapper.setData({ lobbyCode: 'LOBBY123' });
    wrapper.vm.joinLobby();
    expect(socket.emit).toHaveBeenCalledWith('joinLobby', {
      username: 'testuser',
      code: 'LOBBY123'
    });
  });

  it('chiama socket.emit con i parametri corretti quando startMultiGame è invocato', () => {
    wrapper.setData({
      currentLobbyCode: 'LOBBY456',
      selectedMode: 'versus',
      selectedDifficulty: 'hard'
    });
    wrapper.vm.startMultiGame();
    expect(socket.emit).toHaveBeenCalledWith('checkForStartMultiGame', {
      lobbyCode: 'LOBBY456',
      mode: 'versus',
      username: 'testuser',
      difficulty: 'hard'
    });
  });

  it('esegue copyLobbyCode chiamando navigator.clipboard.writeText', async () => {
    const writeTextMock = jest.fn().mockResolvedValue();
    global.navigator.clipboard = { writeText: writeTextMock };
    wrapper.setData({ currentLobbyCode: 'COPYME' });

    await wrapper.vm.copyLobbyCode();

    expect(writeTextMock).toHaveBeenCalledWith('COPYME');
  });

  it('esegue leaveLobbyAndGoHome correttamente', () => {
    // Imposta lo stato necessario per il test
    sessionStorage.setItem('lobbyCode', 'OLD_LOBBY');
    wrapper.vm.inLobby = true;
    wrapper.vm.currentLobbyCode = 'TESTLOBBY';
    wrapper.vm.players = [{ username: 'testuser', isMaster: true }];
    wrapper.vm.lobbyCode = 'QUALCOSA';
    wrapper.vm.$router = { push: routerPushMock };

    wrapper.vm.leaveLobbyAndGoHome();

    // Verifica che venga chiamato socket.emit per lasciare la lobby
    expect(socket.emit).toHaveBeenCalledWith('leaveLobby', {
      code: 'TESTLOBBY',
      username: 'testuser'
    });
    // Verifica la pulizia dello stato locale e la navigazione a Home
    expect(sessionStorage.getItem('lobbyCode')).toBeNull();
    expect(wrapper.vm.inLobby).toBe(false);
    expect(wrapper.vm.currentLobbyCode).toBe("");
    expect(wrapper.vm.players).toEqual([]);
    expect(wrapper.vm.isMaster).toBe(false);
    expect(wrapper.vm.lobbyCode).toBe("");
    expect(wrapper.vm.lobbyCodeError).toBe("");
    expect(wrapper.vm.errorOnStart).toBe("");
    expect(routerPushMock).toHaveBeenCalledWith({ name: 'Home' });
  });
});
