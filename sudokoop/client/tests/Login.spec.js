import {mount} from '@vue/test-utils';
import Login from '@/views/Login.vue';
import axios from '@/main.js';
import socket from '@/plugins/socket.js';

// Mock di axios e socket
jest.mock('@/main.js', () => ({
  post: jest.fn()
}));
jest.mock('@/plugins/socket.js', () => ({
  emit: jest.fn()
}));

describe('Login.vue', () => {
  let wrapper;
  let routerPushMock;

  beforeEach(() => {
    // Configura un mock per $router
    routerPushMock = jest.fn();
    const router = {
      push: routerPushMock
    };

    sessionStorage.clear();

    // Monta il componente con il mock del router
    wrapper = mount(Login, {
      global: {
        mocks: {
          $router: router
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('mostra messaggio di già loggato se utente è presente in sessionStorage', async () => {
    // Imposta un utente già loggato
    sessionStorage.setItem('username', 'testuser');

    // Rimonta il componente per far scattare il mounted hook
    const router = {push: jest.fn()};
    wrapper = mount(Login, {
      global: {mocks: {$router: router}}
    });

    // Attendi l'aggiornamento della vista
    await wrapper.vm.$nextTick();

    // Verifica che il messaggio di già loggato sia presente e i dati interni siano corretti
    expect(wrapper.vm.alreadyLogged).toBe(true);
    expect(wrapper.vm.storedUsername).toBe('testuser');
    expect(wrapper.text()).toContain('Sei già loggato come');
  });

  it('invia il modulo e naviga a Home in caso di successo', async () => {
    axios.post.mockResolvedValue({});

    // Imposta valori per username e password
    await wrapper.setData({username: 'user1', password: 'pass'});

    // Simula la chiamata onSubmit
    await wrapper.vm.onSubmit();

    expect(axios.post).toHaveBeenCalledWith('/login', {
      userName: 'user1',
      password: 'pass'
    });
    expect(socket.emit).toHaveBeenCalledWith('username', 'user1');
    expect(sessionStorage.getItem('username')).toBe('user1');
    expect(routerPushMock).toHaveBeenCalledWith({name: 'Home'});
  });

  it('gestisce errori di login', async () => {
    axios.post.mockRejectedValue({
      response: {data: {error: 'Credenziali errate'}}
    });

    await wrapper.setData({username: 'user1', password: 'wrongpass'});
    await wrapper.vm.onSubmit();

    expect(wrapper.vm.loginError).toBe('Credenziali errate');
  });

  it('naviga a Register quando goRegister è chiamato', () => {
    wrapper.vm.goRegister();
    expect(routerPushMock).toHaveBeenCalledWith({name: 'Register'});
  });

  it('decrementa il countdown e poi naviga a Home in startCountdown', async () => {
    jest.useFakeTimers();
    const router = {push: jest.fn()};

    // Rimonta il componente con un nuovo router mock
    wrapper = mount(Login, {
      global: {mocks: {$router: router}}
    });

    wrapper.vm.countdown = 2;
    wrapper.vm.startCountdown();

    jest.advanceTimersByTime(1000);
    expect(wrapper.vm.countdown).toBe(1);

    jest.advanceTimersByTime(1000);
    expect(router.push).toHaveBeenCalledWith({name: 'Home'});

    jest.useRealTimers();
  });
});
