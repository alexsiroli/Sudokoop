import {mount} from '@vue/test-utils';
import ChatBox from '@/components/ChatBox.vue';
import socket from '@/plugins/socket.js';

jest.mock('@/plugins/socket.js', () => ({
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
}));

describe('ChatBox.vue', () => {
  let wrapper;
  const lobbyCode = 'LOBBY123';

  beforeEach(() => {
    sessionStorage.setItem('username', 'testuser');
    wrapper = mount(ChatBox, {
      props: {lobbyCode}
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('inizializza username da sessionStorage', () => {
    expect(wrapper.vm.username).toBe('testuser');
  });

  it('non invia messaggi vuoti', () => {
    wrapper.setData({newMessage: '    '});
    wrapper.vm.sendMessage();
    expect(socket.emit).not.toHaveBeenCalled();
  });

  it('emette lobbyMessage con dati corretti', () => {
    wrapper.setData({newMessage: 'Hello'});
    wrapper.vm.sendMessage();
    expect(socket.emit).toHaveBeenCalledWith("lobbyMessage", {
      lobbyCode,
      author: 'testuser',
      text: 'Hello'
    });
    expect(wrapper.vm.newMessage).toBe('');
  });

  it('getMessageStyle restituisce verde per join', () => {
    const style = wrapper.vm.getMessageStyle({type: 'join'});
    expect(style).toEqual({color: 'green'});
  });

  it('getMessageStyle restituisce rosso per leave', () => {
    const style = wrapper.vm.getMessageStyle({type: 'leave'});
    expect(style).toEqual({color: 'red'});
  });

  it('getMessageStyle utilizza getUserColor per altri tipi', () => {
    wrapper.vm.userColorMap = {'user1': '#fff'};
    const style = wrapper.vm.getMessageStyle({type: 'chat', author: 'user1'});
    expect(style).toEqual({color: '#fff'});
  });

  it('getUserColor restituisce nero se utente non trovato', () => {
    wrapper.vm.userColorMap = {};
    expect(wrapper.vm.getUserColor('unknown')).toBe('#000000');
  });
});
