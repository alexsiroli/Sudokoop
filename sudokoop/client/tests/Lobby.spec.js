import {mount} from '@vue/test-utils';
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
    sessionStorage.setItem('username', 'testuser');
    routerPushMock = jest.fn();

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

  // RIMOSSO/COMMENTATO: Non esiste più un metodo "createLobby" nel componente Lobby
  // it('chiama socket.emit con i parametri corretti quando createLobby è invocato', () => {
  //   wrapper.vm.createLobby(); // <-- Non esiste più
  //   expect(socket.emit).toHaveBeenCalledWith('createLobby', 'testuser');
  // });

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
      lobbyCode: 'LOBBY456',
      selectedMode: 'versus',
      selectedDifficulty: 'hard'
    });
    wrapper.vm.startMultiGame();
    expect(socket.emit).toHaveBeenCalledWith('checkMultiGameStart', {
      lobbyCode: 'LOBBY456',
      mode: 'versus',
      difficulty: 'hard'
    });
  });

  it('esegue copyLobbyCode chiamando navigator.clipboard.writeText', async () => {
    const writeTextMock = jest.fn().mockResolvedValue();
    global.navigator.clipboard = { writeText: writeTextMock };
    wrapper.setData({ lobbyCode: 'COPYME' });

    await wrapper.vm.copyLobbyCode();
    expect(writeTextMock).toHaveBeenCalledWith('COPYME');
  });

  it('esegue leaveLobbyAndGoHome correttamente', () => {
    sessionStorage.setItem('lobbyCode', 'OLD_LOBBY');
    wrapper.vm.inLobby = true;
    wrapper.vm.lobbyCode = 'TESTLOBBY';
    wrapper.vm.players = [{username: 'testuser', isMaster: true}];
    wrapper.vm.$router = { push: routerPushMock };

    wrapper.vm.leaveLobbyAndGoHome();

    expect(socket.emit).toHaveBeenCalledWith('leaveLobby', {
      code: 'TESTLOBBY',
      username: 'testuser'
    });
    expect(sessionStorage.getItem('lobbyCode')).toBeNull();
    expect(wrapper.vm.inLobby).toBe(false);
    expect(wrapper.vm.isMaster).toBe(false);
    expect(wrapper.vm.lobbyCode).toBe("");
    expect(wrapper.vm.lobbyCodeError).toBe("");
    expect(wrapper.vm.errorOnStart).toBe("");
    expect(routerPushMock).toHaveBeenCalledWith({name: 'Home'});
  });
});
